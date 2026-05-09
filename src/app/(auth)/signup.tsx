import { useEffect, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../core/auth';
import { useGoogleAuth, getIdTokenFromResponse } from '../../core/auth/google-auth';
import { Button, Spinner } from 'heroui-native';
import { mflColors } from '../../constants/colors';
import { AppText } from '../../components/app-text';
import { SignupForm } from '../../features/auth/components/signup-form';

export default function SignupScreen() {
  const { login, loginWithGoogle } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Google Sign-In response
  useEffect(() => {
    if (!response) return;
    const idToken = getIdTokenFromResponse(response);
    if (!idToken) return;

    setIsGoogleLoading(true);
    setError('');
    loginWithGoogle({ idToken })
      .then(({ isNewUser }) => {
        if (isNewUser) {
          router.replace('/(app)/complete-profile');
        } else {
          router.replace('/(app)/(tabs)/dashboard');
        }
      })
      .catch((err: any) => {
        const message = err?.response?.data?.error || 'Google sign-up failed. Please try again.';
        setError(message);
      })
      .finally(() => setIsGoogleLoading(false));
  }, [response, loginWithGoogle]);

  // After OTP verification succeeds, auto-login and navigate
  const handleSignupSuccess = async (email: string, password: string) => {
    try {
      await login({ email, password });
      router.replace('/(app)/(tabs)/dashboard');
    } catch {
      // Account was created but auto-login failed — send to login screen
      router.replace('/(auth)/login');
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
          paddingTop: insets.top + 40,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require('../../../assets/mfl-logo.png')}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </View>

        {/* Google error banner */}
        {error ? (
          <View className="bg-danger-50 p-3 rounded-lg mb-4">
            <AppText className="text-sm" style={{ color: '#DC2626' }}>{error}</AppText>
          </View>
        ) : null}

        {/* Signup form (details + OTP steps) */}
        <SignupForm
          isGoogleLoading={isGoogleLoading}
          onSignupSuccess={handleSignupSuccess}
          onError={setError}
        />

        {/* Separator */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-border" />
          <AppText className="text-sm text-muted mx-4">Or continue with</AppText>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Google Sign-Up */}
        <Button
          variant="secondary"
          size="lg"
          onPress={() => promptAsync()}
          isDisabled={!request || isGoogleLoading}
          className="w-full"
        >
          {isGoogleLoading ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Sign up with Google</Button.Label>
          )}
        </Button>

        {/* Login link */}
        <View className="flex-row justify-center mt-6">
          <AppText className="text-sm text-muted">Already have an account? </AppText>
          <Pressable onPress={() => router.back()}>
            <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
              Sign in
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
