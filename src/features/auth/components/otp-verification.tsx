import { Pressable, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { authInputStyle } from '../styles/auth-input-style';

const OTP_LENGTH = 6;

interface OtpVerificationProps {
  email: string;
  otp: string;
  isLoading: boolean;
  error: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}

export function OtpVerification({
  email,
  otp,
  isLoading,
  error,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
}: OtpVerificationProps) {
  return (
    <View className="gap-4">
      {/* Back */}
      <Pressable
        onPress={onBack}
        disabled={isLoading}
        className="flex-row items-center gap-1"
      >
        <Feather name="arrow-left" size={16} color={mflColors.textMuted} />
        <AppText className="text-sm text-muted">Back</AppText>
      </Pressable>

      {/* Header */}
      <View className="items-center gap-1 mb-2">
        <AppText className="text-2xl font-bold text-foreground">Verify your email</AppText>
        <AppText className="text-sm text-muted">
          We sent a verification code to{' '}
          <AppText className="text-sm font-medium text-foreground">{email}</AppText>
        </AppText>
      </View>

      {error ? (
        <View className="bg-danger-50 p-3 rounded-lg">
          <AppText className="text-sm" style={{ color: '#DC2626' }}>
            {error}
          </AppText>
        </View>
      ) : null}

      {/* OTP Field */}
      <View className="gap-1">
        <View className="flex-row items-center gap-0.5">
          <AppText className="text-sm font-medium text-muted">Verification Code</AppText>
          <AppText className="text-sm font-medium" style={{ color: mflColors.danger }}>*</AppText>
        </View>
        <TextInput
          style={[
            authInputStyle,
            { textAlign: 'center', letterSpacing: 8, fontFamily: 'monospace' },
          ]}
          value={otp}
          onChangeText={(text) => onOtpChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
          placeholder="000000"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          editable={!isLoading}
        />
        <AppText className="text-xs text-muted text-center mt-1">
          Enter the {OTP_LENGTH}-digit code sent to your email
        </AppText>
      </View>

      {/* Verify Button */}
      <Button
        variant="primary"
        size="lg"
        onPress={onVerify}
        isDisabled={isLoading || otp.length !== OTP_LENGTH}
        className="w-full"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <Button.Label>Verify &amp; Create Account</Button.Label>
        )}
      </Button>

      {/* Resend */}
      <View className="items-center mt-1">
        <Pressable onPress={onResend} disabled={isLoading}>
          <AppText className="text-sm text-muted">
            Didn't receive the code?{' '}
            <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
              Resend
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
