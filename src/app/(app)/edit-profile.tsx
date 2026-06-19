import { useCallback, useEffect, useState } from 'react';
import { View, TextInput, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { useUserProfile } from '../../features/profile/hooks/use-user-profile';
import { updateUserProfile } from '../../features/profile/services/profile.service';
import { api } from '../../core/api';
import { queryKeys } from '../../core/config';
import { extractApiError } from '../../features/auth/utils/extract-api-error';


function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

async function uploadProfilePicture(uri: string): Promise<string> {
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  const formData = new FormData();
  // React Native's FormData accepts this object shape for file uploads.
  // The cast to unknown→Blob is required because the RN FormData types
  // don't match the browser Blob signature, but the runtime accepts it correctly.
  formData.append('file', { uri, name: filename, type } as unknown as Blob);

  const res = await api.post<{ success: boolean; data: { url: string } }>(
    '/api/upload/profile-picture',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return res.data.data.url;
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: profileLoading,
  } = useUserProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Pre-populate form fields when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.username ?? '');
      setPhone(profile.phone ?? '');
      setDateOfBirth(profile.dateOfBirth ?? '');
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  const handlePickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to change your profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const selectedUri = result.assets[0].uri;
    setLocalImageUri(selectedUri);

    // Upload the image immediately
    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await uploadProfilePicture(selectedUri);
      setAvatarUrl(uploadedUrl);
    } catch {
      Alert.alert('Upload Failed', 'Could not upload the photo. Please try again.');
      setLocalImageUri(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      Alert.alert('Validation Error', 'Name must be at least 3 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: trimmedName,
        phone: phone.trim() || null,
        date_of_birth: dateOfBirth.trim() || null,
        profile_picture_url: avatarUrl,
      });

      // Invalidate the profile cache so it refreshes everywhere
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });

      router.back();
    } catch (err: unknown) {
      Alert.alert('Error', extractApiError(err, 'Failed to update profile. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  }, [name, phone, dateOfBirth, avatarUrl, queryClient, router]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="edit-profile" state="loading" message="Loading profile..." />
      </ScreenScrollView>
    );
  }

  const displayImageUri = localImageUri ?? avatarUrl;
  const displayName = name || profile?.username || 'User';

  return (
    <ScreenScrollView avoidKeyboard>
      <View className="py-6 gap-6">
        {/* Avatar Section */}
        <View className="items-center gap-3">
          <View className="relative">
            <Avatar size="lg" alt={displayName}>
              {displayImageUri ? (
                <Avatar.Image source={{ uri: displayImageUri }} />
              ) : null}
              <Avatar.Fallback>
                <AppText className="text-2xl font-bold">
                  {getInitials(displayName)}
                </AppText>
              </Avatar.Fallback>
            </Avatar>

            {isUploadingPhoto && (
              <View className="absolute inset-0 rounded-full items-center justify-center bg-black/40">
                <Spinner size="sm" color="white" />
              </View>
            )}
          </View>

          <Pressable onPress={handlePickImage} disabled={isUploadingPhoto}>
            <View className="flex-row items-center gap-1.5">
              <Feather name="camera" size={14} color={mflColors.brand} />
              <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
                {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View className="gap-5">
          <SectionLabel label="Personal Details" />

          {/* Name */}
          <View className="gap-1.5">
            <AppText className="text-xs font-semibold text-muted uppercase tracking-wider">
              Name
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={mflColors.textMuted}
              autoCapitalize="words"
              className="bg-default-100 rounded-xl px-4 py-3 text-base text-foreground"
              style={{ fontFamily: undefined }}
            />
          </View>

          {/* Email (read-only) */}
          {profile?.email && (
            <View className="gap-1.5">
              <AppText className="text-xs font-semibold text-muted uppercase tracking-wider">
                Email
              </AppText>
              <View className="bg-default-100 rounded-xl px-4 py-3 opacity-60">
                <AppText className="text-base text-foreground">
                  {profile.email}
                </AppText>
              </View>
              <AppText className="text-[10px] text-muted">
                Email cannot be changed
              </AppText>
            </View>
          )}

          {/* Phone */}
          <View className="gap-1.5">
            <AppText className="text-xs font-semibold text-muted uppercase tracking-wider">
              Phone
            </AppText>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={mflColors.textMuted}
              keyboardType="phone-pad"
              inputMode="tel"
              className="bg-default-100 rounded-xl px-4 py-3 text-base text-foreground"
              style={{ fontFamily: undefined }}
            />
          </View>

          {/* Date of Birth */}
          <View className="gap-1.5">
            <AppText className="text-xs font-semibold text-muted uppercase tracking-wider">
              Date of Birth
            </AppText>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={mflColors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              className="bg-default-100 rounded-xl px-4 py-3 text-base text-foreground"
              style={{ fontFamily: undefined }}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          size="lg"
          style={{ backgroundColor: mflColors.brand }}
          onPress={handleSave}
          isDisabled={isSaving || isUploadingPhoto}
          className="w-full mt-4"
        >
          <Button.Label>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button.Label>
        </Button>
      </View>
    </ScreenScrollView>
  );
}
