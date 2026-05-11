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
      router.push({ pathname: '/(auth)/reset-password', params: { email: trimmedEmail } });
    } catch (err: any) {
      const message =
        err?.response?.status === 429
          ? err?.response?.data?.error || 'Too many attempts. Please try again later.'
          : err?.response?.data?.error || 'Failed to send verification code. Please try again.';
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
              style={inputStyle}
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
            {isLoading ? <Spinner size="sm" /> : <Button.Label>Send Verification Code</Button.Label>}
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
