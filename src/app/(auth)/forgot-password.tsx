import { useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { mflColors } from '../../constants/colors';
import { AppText } from '../../components/app-text';
import { sendOtp } from '../../features/auth/services/otp.service';
import { AppRoutes } from '../../core/config/routes';
import { extractApiError } from '../../features/auth/utils/extract-api-error';
import { authInputStyle } from '../../features/auth/styles/auth-input-style';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await sendOtp(trimmedEmail);
      router.push({ pathname: AppRoutes.resetPassword, params: { email: trimmedEmail } });
    } catch (err: unknown) {
      setError(extractApiError(err, 'Failed to send verification code. Please try again.'));
    } finally {
      setIsLoading(false);
    }
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

        {/* Form */}
        <View className="gap-4">
          <AppText className="text-2xl font-bold text-foreground mb-2">Forgot Password</AppText>
          <AppText className="text-sm text-muted mb-2">
            Enter the email address associated with your account and we'll send you a verification
            code to reset your password.
          </AppText>

          {error ? (
            <View className="bg-danger-50 p-3 rounded-lg">
              <AppText className="text-sm" style={{ color: '#DC2626' }}>
                {error}
              </AppText>
            </View>
          ) : null}

          <View className="gap-1">
            <AppText className="text-sm font-medium text-muted">Email</AppText>
            <TextInput
              style={authInputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={mflColors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              inputMode="email"
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSendOtp}
            isDisabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Send Verification Code</Button.Label>
            )}
          </Button>

          <View className="flex-row justify-center mt-4">
            <AppText className="text-sm text-muted">Remember your password? </AppText>
            <Pressable onPress={() => router.back()}>
              <AppText className="text-sm font-semibold" style={{ color: '#00C48C' }}>
                Sign in
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
