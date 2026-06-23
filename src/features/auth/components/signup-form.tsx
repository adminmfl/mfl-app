import { useState } from 'react';
import { Alert } from 'react-native';
import { sendSignupOtp, verifySignupOtp } from '../services/signup.service';
import { extractApiError } from '../utils/extract-api-error';
import { SignupFields } from './signup-fields';
import { OtpVerification } from './otp-verification';
import type { Gender, SignupFormState, SignupFormActions } from '../types';

// ── Constants ──
const MIN_PASSWORD_LENGTH = 6;
const OTP_LENGTH = 6;

type SignupStep = 'details' | 'verify-otp';

interface SignupFormProps {
  isGoogleLoading: boolean;
  onSignupSuccess: (email: string, password: string) => void;
  onError: (msg: string) => void;
}

// ── Validation ──
function validateSignupForm(fields: {
  email: string;
  username: string;
  dateOfBirth: string;
  gender: Gender | '';
  password: string;
  confirmPassword: string;
}): string | null {
  if (!fields.email.trim()) return 'Please enter your email.';
  if (!fields.username.trim()) return 'Please enter a username.';
  if (!fields.dateOfBirth) return 'Please select your date of birth.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.dateOfBirth)) {
    return 'Please select a valid date of birth.';
  }
  if (!fields.gender) return 'Please select your gender.';
  if (!fields.password) return 'Please enter a password.';
  if (fields.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (fields.password !== fields.confirmPassword) return 'Passwords do not match.';
  return null;
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormDisabled = isLoading || isGoogleLoading;

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    const validationError = validateSignupForm({
      email, username, dateOfBirth, gender, password, confirmPassword,
    });
    if (validationError) {
      setError(validationError);
      onError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const data = await sendSignupOtp(email.trim().toLowerCase());
      if (data.error) {
        setError(data.error);
        onError(data.error);
      } else {
        setStep('verify-otp');
      }
    } catch (err: unknown) {
      const msg = extractApiError(err, 'An error occurred sending verification code.');
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
    } catch (err: unknown) {
      const msg = extractApiError(err, 'An error occurred during verification.');
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
      if (data.error) {
        setError(data.error);
      } else {
        setOtp('');
        Alert.alert('Sent', 'New verification code sent!');
      }
    } catch (err: unknown) {
      setError(extractApiError(err, 'Failed to resend verification code.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify-otp') {
    return (
      <OtpVerification
        email={email}
        otp={otp}
        isLoading={isLoading}
        error={error}
        onOtpChange={setOtp}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={() => { setStep('details'); setOtp(''); setError(''); }}
      />
    );
  }

  const formState: SignupFormState = {
    email,
    username,
    phone,
    dateOfBirth,
    gender,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    showDatePicker,
  };

  const formActions: SignupFormActions = {
    onEmailChange: setEmail,
    onUsernameChange: setUsername,
    onPhoneChange: setPhone,
    onDateChange: setDateOfBirth,
    onGenderChange: setGender,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onToggleShowPassword: () => setShowPassword((p) => !p),
    onToggleShowConfirmPassword: () => setShowConfirmPassword((p) => !p),
    onToggleDatePicker: () => setShowDatePicker((p) => !p),
  };

  return (
    <SignupFields
      formState={formState}
      formActions={formActions}
      isDisabled={isFormDisabled}
      isLoading={isLoading}
      error={error}
      onSubmit={handleSendOtp}
    />
  );
}
