import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { Button, Spinner } from 'heroui-native';
import { mflColors } from '../../../constants/colors';
import { AppText } from '../../../components/app-text';
import { sendSignupOtp, verifySignupOtp } from '../services/signup.service';

// ── Constants (match web) ──
const MIN_PASSWORD_LENGTH = 6;
const OTP_LENGTH = 6;

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

type SignupStep = 'details' | 'verify-otp';

interface SignupFormProps {
  isGoogleLoading: boolean;
  onSignupSuccess: (email: string, password: string) => void;
  onError: (msg: string) => void;
}

const inputStyle = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: '#0F172A',
} as const;

const DOB_MIN_DATE = new Date(1920, 0, 1);
const DOB_MAX_DATE = new Date();

function formatDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateYmd(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() - 25);
  return fallback;
}

function formatDisplayDob(value: string): string {
  if (!value) return 'Select date of birth';
  try {
    const dt = parseDateYmd(value);
    return dt.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function FieldLabel({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-0.5">
      <AppText className="text-sm font-medium text-muted">{children}</AppText>
      {required ? (
        <AppText className="text-sm font-medium" style={{ color: mflColors.danger }}>
          *
        </AppText>
      ) : null}
    </View>
  );
}

export function SignupForm({ isGoogleLoading, onSignupSuccess, onError }: SignupFormProps) {
  // Form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // UI state
  const [step, setStep] = useState<SignupStep>('details');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDobChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDobPicker(false);
    }
    if (event.type === 'dismissed') {
      setShowDobPicker(false);
      return;
    }
    if (selectedDate) {
      setDateOfBirth(formatDateYmd(selectedDate));
    }
  };

  const isFormDisabled = isLoading || isGoogleLoading;

  // ── Validation (matches web) ──
  const validateForm = (): string | null => {
    if (!email.trim()) return 'Please enter your email.';
    if (!username.trim()) return 'Please enter a username.';
    if (!dateOfBirth) return 'Please select your date of birth.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      return 'Please select a valid date of birth.';
    }
    if (!gender) return 'Please select your gender.';
    if (!password) return 'Please enter a password.';
    if (password.length < MIN_PASSWORD_LENGTH)
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      onError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const data = await sendSignupOtp(email.trim().toLowerCase());
      if ((data as any).error) {
        const msg = (data as any).error;
        setError(msg);
        onError(msg);
      } else {
        setStep('verify-otp');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || 'An error occurred sending verification code.';
      setError(msg);
      onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Create Account ──
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setError(`Verification code must be ${OTP_LENGTH} digits.`);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const data = await verifySignupOtp({
        email: email.trim().toLowerCase(),
        otp,
        createUser: true,
        password,
        username: username.trim(),
        phone: phone.trim() || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
      });

      if (data.error) {
        setError(data.error);
        onError(data.error);
        setIsLoading(false);
        return;
      }

      onSignupSuccess(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'An error occurred during verification.';
      setError(msg);
      onError(msg);
      setIsLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const data = await sendSignupOtp(email.trim().toLowerCase());
      if ((data as any).error) {
        setError((data as any).error);
      } else {
        setOtp('');
        Alert.alert('Sent', 'New verification code sent!');
      }
    } catch {
      setError('Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Gender picker (simple ActionSheet-like) ──
  const showGenderPicker = () => {
    Alert.alert(
      'Select Gender',
      undefined,
      [
        ...GENDER_OPTIONS.map((opt) => ({
          text: opt.label,
          onPress: () => setGender(opt.value),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  // ── Error Banner ──
  const renderError = () =>
    error ? (
      <View className="bg-danger-50 p-3 rounded-lg">
        <AppText className="text-sm" style={{ color: '#DC2626' }}>
          {error}
        </AppText>
      </View>
    ) : null;

  // ─────────────────── OTP Step ───────────────────
  if (step === 'verify-otp') {
    return (
      <View className="gap-4">
        {/* Back */}
        <Pressable
          onPress={() => {
            setStep('details');
            setOtp('');
            setError('');
          }}
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

        {renderError()}

        {/* OTP Field */}
        <View className="gap-1">
          <FieldLabel required>Verification Code</FieldLabel>
          <TextInput
            style={[inputStyle, { textAlign: 'center', letterSpacing: 8, fontFamily: 'monospace' }]}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, OTP_LENGTH))}
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
          onPress={handleVerifyOtp}
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
          <Pressable onPress={handleResendOtp} disabled={isLoading}>
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

  // ─────────────────── Details Step ───────────────────
  return (
    <View className="gap-4">
      {/* Header */}
      <View className="items-center gap-1 mb-2">
        <AppText className="text-2xl font-bold text-foreground">Create your account</AppText>
        <AppText className="text-sm text-muted">Enter your details below to create your account</AppText>
      </View>

      {renderError()}

      {/* Email */}
      <View className="gap-1">
        <FieldLabel required>Email</FieldLabel>
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
          editable={!isFormDisabled}
        />
      </View>

      {/* Username */}
      <View className="gap-1">
        <FieldLabel required>Username</FieldLabel>
        <TextInput
          style={inputStyle}
          value={username}
          onChangeText={setUsername}
          placeholder="johndoe"
          placeholderTextColor={mflColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          editable={!isFormDisabled}
        />
      </View>

      {/* Phone (optional) */}
      <View className="gap-1">
        <View className="flex-row items-center">
          <AppText className="text-sm font-medium text-muted">Phone</AppText>
          <AppText className="text-xs text-muted ml-auto">Optional</AppText>
        </View>
        <TextInput
          style={inputStyle}
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="phone-pad"
          autoComplete="tel"
          editable={!isFormDisabled}
        />
      </View>

      {/* Date of Birth */}
      <View className="gap-1">
        <FieldLabel required>Date of Birth</FieldLabel>
        <Pressable
          onPress={() => setShowDobPicker(true)}
          disabled={isFormDisabled}
          style={[
            inputStyle,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
          ]}
        >
          <AppText
            className="text-sm"
            style={{ color: dateOfBirth ? mflColors.text : mflColors.textMuted }}
          >
            {formatDisplayDob(dateOfBirth)}
          </AppText>
          <Feather name="calendar" size={18} color={mflColors.textMuted} />
        </Pressable>
        {showDobPicker ? (
          <View className="rounded-xl overflow-hidden border border-default-200">
            <DateTimePicker
              value={parseDateYmd(dateOfBirth)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={DOB_MIN_DATE}
              maximumDate={DOB_MAX_DATE}
              onChange={handleDobChange}
            />
            {Platform.OS === 'ios' ? (
              <Pressable
                onPress={() => setShowDobPicker(false)}
                className="py-3 items-center"
                style={{ borderTopWidth: 1, borderTopColor: '#E2E8F0' }}
              >
                <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
                  Done
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Gender */}
      <View className="gap-1">
        <FieldLabel required>Gender</FieldLabel>
        <Pressable
          onPress={showGenderPicker}
          disabled={isFormDisabled}
          style={[inputStyle, { justifyContent: 'center' }]}
        >
          <AppText
            className="text-sm"
            style={{ color: gender ? mflColors.text : mflColors.textMuted }}
          >
            {gender
              ? GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? 'Select gender'
              : 'Select gender'}
          </AppText>
        </Pressable>
      </View>

      {/* Password */}
      <View className="gap-1">
        <FieldLabel required>Password</FieldLabel>
        <View>
          <TextInput
            style={[inputStyle, { paddingRight: 48 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={mflColors.textMuted}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            editable={!isFormDisabled}
          />
          <Pressable
            onPress={() => setShowPassword((p) => !p)}
            disabled={isFormDisabled}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color={mflColors.textMuted}
            />
          </Pressable>
        </View>
        <AppText className="text-xs text-muted mt-0.5">
          Must be at least {MIN_PASSWORD_LENGTH} characters
        </AppText>
      </View>

      {/* Confirm Password */}
      <View className="gap-1">
        <FieldLabel required>Confirm Password</FieldLabel>
        <View>
          <TextInput
            style={[inputStyle, { paddingRight: 48 }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={mflColors.textMuted}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            editable={!isFormDisabled}
          />
          <Pressable
            onPress={() => setShowConfirmPassword((p) => !p)}
            disabled={isFormDisabled}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Feather
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={18}
              color={mflColors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleSendOtp}
        isDisabled={isFormDisabled}
        className="w-full"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <Button.Label>Continue</Button.Label>
        )}
      </Button>
    </View>
  );
}
