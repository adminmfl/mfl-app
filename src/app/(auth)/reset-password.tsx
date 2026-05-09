import { useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Button, Spinner } from 'heroui-native';
import { mflColors } from '../../constants/colors';
import { AppText } from '../../components/app-text';
import { resetPassword } from '../../features/auth/services/otp.service';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Missing email address. Please request a new code.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await resetPassword(email, otp.trim(), newPassword);
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.error || 'Failed to reset password. Please try again.';
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
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 60,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View className="items-center mb-10">
          <AppText
            className="text-5xl font-bold"
            style={{ color: '#00C48C', letterSpacing: 2 }}
          >
            MFL
          </AppText>
          <AppText className="text-sm text-muted mt-1">My Fitness League</AppText>
        </View>

        {/* Success State */}
        {success ? (
          <View className="gap-4">
            <View className="bg-success-50 p-4 rounded-lg">
              <AppText className="text-base font-semibold text-foreground mb-1">
                Password Reset Successful
              </AppText>
              <AppText className="text-sm text-muted">
                Your password has been updated. You can now sign in with your new password.
              </AppText>
            </View>
            <Button
              variant="primary"
              size="lg"
              onPress={() => router.replace('/(auth)/login')}
              className="w-full"
            >
              <Button.Label>Go to Sign In</Button.Label>
            </Button>
          </View>
        ) : (
          /* Form */
          <View className="gap-4">
            <AppText className="text-2xl font-bold text-foreground mb-2">Reset Password</AppText>
            <AppText className="text-sm text-muted mb-2">
              Enter the verification code sent to{' '}
              <AppText className="text-sm font-semibold text-foreground">{email}</AppText> and
              choose a new password.
            </AppText>

            {error ? (
              <View className="bg-danger-50 p-3 rounded-lg">
                <AppText className="text-sm" style={{ color: '#DC2626' }}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">Verification Code</AppText>
              <TextInput
                style={inputStyle}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit code"
                placeholderTextColor={mflColors.textMuted}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
                inputMode="numeric"
              />
            </View>

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">New Password</AppText>
              <View>
                <TextInput
                  style={{ ...inputStyle, paddingRight: 48 }}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={mflColors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={mflColors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <View className="gap-1">
              <AppText className="text-sm font-medium text-muted">Confirm New Password</AppText>
              <View>
                <TextInput
                  style={{ ...inputStyle, paddingRight: 48 }}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={mflColors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={mflColors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <Button
              variant="primary"
              size="lg"
              onPress={handleResetPassword}
              isDisabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Spinner size="sm" /> : <Button.Label>Reset Password</Button.Label>}
            </Button>

            <View className="flex-row justify-center mt-4">
              <AppText className="text-sm text-muted">Didn't receive code? </AppText>
              <Pressable onPress={() => router.replace('/(auth)/forgot-password')}>
                <AppText className="text-sm font-semibold" style={{ color: '#00C48C' }}>
                  Resend
                </AppText>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
