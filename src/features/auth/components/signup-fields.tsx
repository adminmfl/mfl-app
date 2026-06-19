import { Platform, Pressable, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { Alert } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { authInputStyle } from '../styles/auth-input-style';
import { formatDateYmd, parseDateYmd, formatDisplayDob } from '../utils/date-helpers';
import { FieldLabel } from './field-label';
import type { Gender } from '../types';

const MIN_PASSWORD_LENGTH = 6;

const DOB_MIN_DATE = new Date(1920, 0, 1);
const DOB_MAX_DATE = new Date();

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

interface SignupFieldsProps {
  email: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | '';
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showDobPicker: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  error: string;
  onEmailChange: (v: string) => void;
  onUsernameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onDateOfBirthChange: (v: string) => void;
  onGenderChange: (v: Gender) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onToggleDobPicker: () => void;
  onSubmit: () => void;
}

export function SignupFields({
  email,
  username,
  phone,
  dateOfBirth,
  gender,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  showDobPicker,
  isDisabled,
  isLoading,
  error,
  onEmailChange,
  onUsernameChange,
  onPhoneChange,
  onDateOfBirthChange,
  onGenderChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onToggleDobPicker,
  onSubmit,
}: SignupFieldsProps) {
  const handleDobChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') onToggleDobPicker();
    if (event.type === 'dismissed') { onToggleDobPicker(); return; }
    if (selectedDate) onDateOfBirthChange(formatDateYmd(selectedDate));
  };

  const handleShowGenderPicker = () => {
    Alert.alert(
      'Select Gender',
      undefined,
      [
        ...GENDER_OPTIONS.map((opt) => ({
          text: opt.label,
          onPress: () => onGenderChange(opt.value),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  return (
    <View className="gap-4">
      {/* Header */}
      <View className="items-center gap-1 mb-2">
        <AppText className="text-2xl font-bold text-foreground">Create your account</AppText>
        <AppText className="text-sm text-muted">
          Enter your details below to create your account
        </AppText>
      </View>

      {error ? (
        <View className="bg-danger-50 p-3 rounded-lg">
          <AppText className="text-sm" style={{ color: '#DC2626' }}>{error}</AppText>
        </View>
      ) : null}

      {/* Email */}
      <View className="gap-1">
        <FieldLabel required>Email</FieldLabel>
        <TextInput
          style={authInputStyle}
          value={email}
          onChangeText={onEmailChange}
          placeholder="you@example.com"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!isDisabled}
        />
      </View>

      {/* Username */}
      <View className="gap-1">
        <FieldLabel required>Username</FieldLabel>
        <TextInput
          style={authInputStyle}
          value={username}
          onChangeText={onUsernameChange}
          placeholder="johndoe"
          placeholderTextColor={mflColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          editable={!isDisabled}
        />
      </View>

      {/* Phone (optional) */}
      <View className="gap-1">
        <View className="flex-row items-center">
          <AppText className="text-sm font-medium text-muted">Phone</AppText>
          <AppText className="text-xs text-muted ml-auto">Optional</AppText>
        </View>
        <TextInput
          style={authInputStyle}
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="+91 98765 43210"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="phone-pad"
          autoComplete="tel"
          editable={!isDisabled}
        />
      </View>

      {/* Date of Birth */}
      <View className="gap-1">
        <FieldLabel required>Date of Birth</FieldLabel>
        <Pressable
          onPress={onToggleDobPicker}
          disabled={isDisabled}
          style={[
            authInputStyle,
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
                onPress={onToggleDobPicker}
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
          onPress={handleShowGenderPicker}
          disabled={isDisabled}
          style={[authInputStyle, { justifyContent: 'center' }]}
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
            style={[authInputStyle, { paddingRight: 48 }]}
            value={password}
            onChangeText={onPasswordChange}
            placeholder="Create a password"
            placeholderTextColor={mflColors.textMuted}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            editable={!isDisabled}
          />
          <Pressable
            onPress={onTogglePassword}
            disabled={isDisabled}
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
        <AppText className="text-xs text-muted mt-0.5">
          Must be at least {MIN_PASSWORD_LENGTH} characters
        </AppText>
      </View>

      {/* Confirm Password */}
      <View className="gap-1">
        <FieldLabel required>Confirm Password</FieldLabel>
        <View>
          <TextInput
            style={[authInputStyle, { paddingRight: 48 }]}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            placeholder="Confirm your password"
            placeholderTextColor={mflColors.textMuted}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            editable={!isDisabled}
          />
          <Pressable
            onPress={onToggleConfirmPassword}
            disabled={isDisabled}
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

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        onPress={onSubmit}
        isDisabled={isDisabled}
        className="w-full"
      >
        {isLoading ? <Spinner size="sm" /> : <Button.Label>Continue</Button.Label>}
      </Button>
    </View>
  );
}
