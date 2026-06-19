import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../../core/auth';
import { useGoogleAuth, getIdTokenFromResponse } from '../../core/auth/google-auth';
import { Button, Spinner } from 'heroui-native';
import { mflColors } from '../../constants/colors';
import { AppText } from '../../components/app-text';
import { AppRoutes } from '../../core/config/routes';
import { extractApiError } from '../../features/auth/utils/extract-api-error';
import { authInputStyle } from '../../features/auth/styles/auth-input-style';

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const isFormDisabled = isLoading || isGoogleLoading;

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
          router.replace(AppRoutes.completeProfile);
        } else {
          router.replace(AppRoutes.dashboard);
        }
      })
      .catch((err: unknown) => {
        setError(extractApiError(err, 'Google sign-in failed. Please try again.'));
      })
      .finally(() => setIsGoogleLoading(false));
  }, [response, loginWithGoogle]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace(AppRoutes.dashboard);
    } catch (err: unknown) {
      setError(extractApiError(
        err,
        'Could not reach the local API. Check EXPO_PUBLIC_API_URL and Android HTTP access.',
      ));
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View className="items-center mb-10">
          <Image
            source={require('../../../assets/mfl-logo.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <AppText className="text-sm text-muted mt-1">My Fitness League</AppText>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="items-center gap-1 mb-2">
            <AppText className="text-2xl font-bold text-foreground">Login to your account</AppText>
            <AppText className="text-sm text-muted">
              Enter your email below to login to your account
            </AppText>
          </View>

          {error ? (
            <View className="bg-danger-50 p-3 rounded-lg">
              <AppText className="text-sm" style={{ color: '#DC2626' }}>{error}</AppText>
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
              editable={!isFormDisabled}
            />
          </View>

          <View className="gap-1">
            <View className="flex-row items-center justify-between">
              <AppText className="text-sm font-medium text-muted">Password</AppText>
              <Pressable onPress={() => router.push(AppRoutes.forgotPassword)}>
                <AppText className="text-sm" style={{ color: '#00C48C' }}>
                  Forgot your password?
                </AppText>
              </Pressable>
            </View>
            <View>
              <TextInput
                style={[authInputStyle, { paddingRight: 48 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={mflColors.textMuted}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!isFormDisabled}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                disabled={isFormDisabled}
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

          <Button
            variant="primary"
            size="lg"
            onPress={handleLogin}
            isDisabled={isFormDisabled}
            className="w-full"
          >
            {isLoading ? <Spinner size="sm" /> : <Button.Label>Login</Button.Label>}
          </Button>

          {/* Separator */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-border" />
            <AppText className="text-sm text-muted mx-4">Or continue with</AppText>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google Sign-In */}
          <Button
            variant="secondary"
            size="lg"
            onPress={() => promptAsync()}
            isDisabled={!request || isFormDisabled}
            className="w-full"
          >
            {isGoogleLoading ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Sign in with Google</Button.Label>
            )}
          </Button>

          <View className="flex-row justify-center mt-4">
            <AppText className="text-sm text-muted">Don't have an account? </AppText>
            <Pressable onPress={() => router.push(AppRoutes.signup)}>
              <AppText className="text-sm font-semibold" style={{ color: '#00C48C' }}>
                Sign up
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
