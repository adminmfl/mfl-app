import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Spinner } from 'heroui-native';
import { mflColors } from '../../constants/colors';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { useAuth } from '../../core/auth';
import { completeProfile } from '../../features/auth/services/otp.service';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [genderLabel, setGenderLabel] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Pre-populate username from session user (matches web behavior)
  useEffect(() => {
    if (user?.email && !username) {
      const nameFromEmail = user.email.split('@')[0] ?? '';
      setUsername(nameFromEmail);
    }
  }, [user?.email, username]);

  const handleCompleteProfile = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!dateOfBirth.trim()) {
      setError('Date of birth is required');
      return;
    }
    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth.trim())) {
      setError('Date of birth must be in YYYY-MM-DD format');
      return;
    }
    const parsedDate = new Date(dateOfBirth.trim());
    if (isNaN(parsedDate.getTime())) {
      setError('Please enter a valid date of birth');
      return;
    }
    if (!gender) {
      setError('Gender is required');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await completeProfile({
        username: username.trim().toLowerCase(),
        password,
        dateOfBirth: dateOfBirth.trim(),
        gender,
        phone: phone.trim() || undefined,
      });
      // Navigate to main app after profile completion
      router.replace('/(app)/(tabs)/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.error || 'Failed to complete profile. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  };

  return (
    <ScreenScrollView avoidKeyboard>
      <View className="py-6 gap-6">
        {/* Header */}
        <View className="gap-2">
          <AppText className="text-2xl font-bold text-foreground">Complete Your Profile</AppText>
          <AppText className="text-sm text-muted">
            Set a password and profile details to finish setting up your account.
          </AppText>
        </View>

        {error ? (
          <View className="bg-danger-50 p-3 rounded-lg">
            <AppText className="text-sm" style={{ color: '#DC2626' }}>
              {error}
            </AppText>
          </View>
        ) : null}

        {/* Username */}
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Username</AppText>
          <TextInput
            style={inputStyle}
            value={username}
            onChangeText={(v) => { setUsername(v); if (error) setError(''); }}
            placeholder="Choose a username"
            placeholderTextColor={mflColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password */}
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Password</AppText>
          <TextInput
            style={inputStyle}
            value={password}
            onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
            placeholder="Min. 6 characters"
            placeholderTextColor={mflColors.textMuted}
            secureTextEntry
          />
        </View>

        {/* Confirm Password */}
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Confirm Password</AppText>
          <TextInput
            style={inputStyle}
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); if (error) setError(''); }}
            placeholder="Re-enter password"
            placeholderTextColor={mflColors.textMuted}
            secureTextEntry
          />
        </View>

        {/* Date of Birth */}
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Date of Birth</AppText>
          <TextInput
            style={inputStyle}
            value={dateOfBirth}
            onChangeText={(v) => { setDateOfBirth(v); if (error) setError(''); }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mflColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>

        {/* Gender */}
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Gender</AppText>
          <Pressable onPress={() => setShowGenderPicker(true)}>
            <View
              style={[
                inputStyle,
                { justifyContent: 'center' },
              ]}
              pointerEvents="none"
            >
              <AppText
                className="text-base"
                style={{ color: gender ? '#0F172A' : mflColors.textMuted }}
              >
                {genderLabel || 'Select gender'}
              </AppText>
            </View>
          </Pressable>

          <Modal
            visible={showGenderPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowGenderPicker(false)}
          >
            <Pressable
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onPress={() => setShowGenderPicker(false)}
            >
              <View
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  width: '80%',
                  maxWidth: 320,
                }}
              >
                <View className="p-4 border-b" style={{ borderBottomColor: '#E2E8F0' }}>
                  <AppText className="text-lg font-semibold text-foreground">Select Gender</AppText>
                </View>
                <FlatList
                  data={GENDER_OPTIONS}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <Pressable
                      className="px-4 py-3"
                      style={
                        gender === item.value
                          ? { backgroundColor: mflColors.brandLight }
                          : undefined
                      }
                      onPress={() => {
                        setGender(item.value);
                        setGenderLabel(item.label);
                        setShowGenderPicker(false);
                        if (error) setError('');
                      }}
                    >
                      <AppText
                        className="text-base"
                        style={{
                          color: gender === item.value ? mflColors.brand : '#0F172A',
                          fontWeight: gender === item.value ? '600' : '400',
                        }}
                      >
                        {item.label}
                      </AppText>
                    </Pressable>
                  )}
                  scrollEnabled={false}
                />
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Phone (optional) */}
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">
            Phone <AppText className="text-xs text-muted">(optional)</AppText>
          </AppText>
          <TextInput
            style={inputStyle}
            value={phone}
            onChangeText={setPhone}
            placeholder="Your phone number"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
            inputMode="tel"
          />
        </View>

        {/* Submit */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleCompleteProfile}
          isDisabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Complete Profile</Button.Label>
          )}
        </Button>
      </View>
    </ScreenScrollView>
  );
}
