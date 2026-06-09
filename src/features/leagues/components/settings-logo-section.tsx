import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { View, Alert, Image } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';
import * as ImagePicker from 'expo-image-picker';
import crashlytics from '@react-native-firebase/crashlytics';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { api } from '../../../core/api';

function reportError(error: unknown): void {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  crashlytics().recordError(normalizedError);
}

interface Props {
  leagueId: string;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export function SettingsLogoSection({ leagueId, logoUrl, onLogoChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const form = new FormData();
      const uri = asset.uri;
      const filename = uri.split('/').pop() || 'logo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      const file = { uri, name: filename, type } as unknown as Blob;

      form.append('file', file);

      const res = await api.post(`/api/leagues/${leagueId}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newUrl = res.data?.data?.url || null;
      onLogoChange(newUrl);
      Alert.alert('Success', 'League logo updated');
    } catch (error: unknown) {
      reportError(error);
      const message = error instanceof Error ? error.message : 'Failed to upload logo';
      Alert.alert('Upload Failed', message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Remove Logo', 'Are you sure you want to remove the league logo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/api/leagues/${leagueId}/logo`);
            onLogoChange(null);
            Alert.alert('Success', 'League logo removed');
          } catch (error: unknown) {
            reportError(error);
            const message = error instanceof Error ? error.message : 'Failed to delete logo';
            Alert.alert('Failed', message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="gap-3">
      <SectionLabel label="LEAGUE LOGO" />
      <AppText className="text-xs text-muted -mt-2">
        PNG/JPEG/WebP, max 2MB. Recommended 512x512.
      </AppText>
      <Card className="p-4">
        <View className="flex-row items-center gap-4">
          {/* Logo preview */}
          <View
            className="h-14 w-14 rounded-xl items-center justify-center overflow-hidden"
            style={{ borderWidth: 1, borderColor: mflColors.border, backgroundColor: mflColors.surface }}
          >
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={{ width: 56, height: 56 }}
                resizeMode="cover"
              />
            ) : (
              <AppText className="text-[10px] text-muted">No logo</AppText>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row gap-2 flex-1">
            <Button
              variant="secondary"
              size="sm"
              onPress={handleUpload}
              isDisabled={uploading}
            >
              {uploading ? (
                <Spinner size="sm" />
              ) : (
                <Button.Label>
                  <Feather name="upload" size={14} color={mflColors.brand} />{' '}Upload
                </Button.Label>
              )}
            </Button>
            {logoUrl && (
              <Button
                variant="secondary"
                size="sm"
                onPress={handleDelete}
                isDisabled={deleting}
              >
                {deleting ? (
                  <Spinner size="sm" />
                ) : (
                  <Button.Label style={{ color: mflColors.danger }}>
                    <Feather name="trash-2" size={14} color={mflColors.danger} />{' '}Remove
                  </Button.Label>
                )}
              </Button>
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}
