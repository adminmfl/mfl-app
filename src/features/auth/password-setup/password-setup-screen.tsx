import { useEffect, useState } from 'react';
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
import Feather from '@expo/vector-icons/Feather';
import { Button, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useAuth } from '../../../core/auth';
import { AppRoutes } from '../../../core/config/routes';
import { extractApiError } from '../utils/extract-api-error';
import { authInputStyle } from '../styles/auth-input-style';
import { useSetPassword } from './use-set-password';

const MIN_PASSWORD_LENGTH = 6;

export default function PasswordSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();
  const setPasswordMutation = useSetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: mflColors.surface }}>
        <Spinner size="sm" />
      </View>
    );
  }

  const validateForm = (): string | null => {
    if (!password) return 'Password is required';
    if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSetPassword = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    try {
      await setPasswordMutation.mutateAsync({ password });
      router.replace('/');
    } catch (err: unknown) {
      setError(extractApiError(err, 'Failed to set your password. Please try again.'));
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
        <View className="items-center mb-10">
          <AppText className="text-5xl font-bold" style={{ color: mflColors.brand, letterSpacing: 2 }}>
            MFL
          </AppText>
          <AppText className="text-sm text-muted mt-1">My Fitness League</AppText>
        </View>

        <View className="gap-4">
          <View className="items-center gap-1 mb-2">
            <AppText className="text-2xl font-bold text-foreground">Set your password</AppText>
            <AppText className="text-sm text-muted text-center">
              Create a password to finish your first login.
            </AppText>
          </View>

          {error ? (
            <View className="bg-danger-50 p-3 rounded-lg">
              <AppText className="text-sm" style={{ color: '#DC2626' }}>{error}</AppText>
            </View>
          ) : null}

          <View className="gap-1">
            <AppText className="text-sm font-medium text-muted">New Password</AppText>
            <View>
              <TextInput
                style={[authInputStyle, { paddingRight: 48 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor={mflColors.textMuted}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                disabled={setPasswordMutation.isPending}
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

          <View className="gap-1">
            <AppText className="text-sm font-medium text-muted">Confirm Password</AppText>
            <View>
              <TextInput
                style={[authInputStyle, { paddingRight: 48 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor={mflColors.textMuted}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <Pressable
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                disabled={setPasswordMutation.isPending}
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
            onPress={handleSetPassword}
            isDisabled={setPasswordMutation.isPending}
            className="w-full"
          >
            {setPasswordMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Continue</Button.Label>
            )}
          </Button>

          <Pressable onPress={() => router.replace(AppRoutes.login)} className="items-center mt-2">
            <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
              Back to sign in
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
