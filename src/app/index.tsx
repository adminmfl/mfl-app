import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  cn,
  InputOTP,
  Surface,
  useToast,
  type InputOTPRef,
} from 'heroui-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { Image } from 'expo-image';
import { AppText } from '../components/app-text';
import { ThemeToggle } from '../components/theme-toggle';
import { useAppTheme } from '../contexts/app-theme-context';
import { useAuth } from '../contexts/AuthContext';
import { countries, getDefaultCountry, type Country } from '../data/countries';


const StyledFeather = withUniwind(Feather);
const StyledTextInput = withUniwind(TextInput);

type Step = 'email' | 'otp';
type ContactMethod = 'email' | 'phone';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const otpRef = useRef<InputOTPRef>(null);
  const { login, verifyOtp, isAuthenticated, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const canResend = resendTimer <= 0;

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Filter countries based on search
  const filteredCountries = countrySearch.trim()
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.dialCode.includes(countrySearch),
      )
    : countries;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  // Show splash screen while restoring session — prevents login screen flash
  if (authLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <StatusBar style="light" />
        <Image
          source={require('../../assets/splash-icon-light.png')}
          style={{ width: 120, height: 120 }}
          contentFit="contain"
        />
      </View>
    );
  }

  const handleSendOTP = async () => {
    // Validate email format when using email contact method
    if (contactMethod === 'email' && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(true);
      return;
    }

    if (!email.trim()) {
      toast.show({
        variant: 'danger',
        label: 'Error',
        description: `Please enter your ${contactMethod}`,
      });
      return;
    }

    const identifier =
      contactMethod === 'phone'
        ? `${selectedCountry.dialCode}${email.trim().replace(/^0+/, '')}`
        : email.trim();

    setLoading(true);
    const result = await login(identifier);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      setResendTimer(60);
      toast.show({
        variant: 'success',
        label: 'OTP Sent',
        description: `Verification code sent to ${email}`,
      });
    } else {
      toast.show({
        variant: 'danger',
        label: 'Error',
        description: result.message || 'Failed to send OTP',
      });
    }
  };

  const handleVerify = async () => {
    setLoading(true);

    const identifier =
      contactMethod === 'phone'
        ? `${selectedCountry.dialCode}${email.trim().replace(/^0+/, '')}`
        : email.trim();

    const result = await verifyOtp(identifier, otp);
    setLoading(false);

    if (result.success) {
      toast.show({
        variant: 'success',
        label: 'Welcome!',
        description: 'Successfully signed in',
      });
      router.replace('/(app)/(tabs)/dashboard');
    } else {
      toast.show({
        variant: 'danger',
        label: 'Error',
        description: result.message || 'Verification failed',
      });
      setOtp('');
      otpRef.current?.clear();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    const identifier =
      contactMethod === 'phone'
        ? `${selectedCountry.dialCode}${email.trim().replace(/^0+/, '')}`
        : email.trim();

    setLoading(true);
    const result = await login(identifier);
    setLoading(false);

    if (result.success) {
      setResendTimer(60);
      toast.show({
        variant: 'success',
        label: 'OTP Resent',
        description: `New code sent to ${email}`,
      });
    } else {
      toast.show({
        variant: 'danger',
        label: 'Error',
        description: 'Failed to resend OTP',
      });
    }
  };

  const handleOTPComplete = (code: string) => {
    setOtp(code);
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google Sign-In for MFL
    toast.show({
      variant: 'info',
      label: 'Coming Soon',
      description: 'Google Sign-In will be available soon',
    });
  };

  if (authLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 50}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Theme toggle */}
          <View className="absolute top-0 right-5 flex-row items-center gap-1" style={{ paddingTop: insets.top + 8 }}>
            <ThemeToggle />
          </View>

          <View className="flex-1 justify-center px-5">
            {/* Branding */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="items-center mb-8"
            >
              <AppText className="text-3xl font-bold text-foreground">
                My Fitness League
              </AppText>
            </Animated.View>

            {/* Main Card */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <Surface className="rounded-2xl p-5">
                {step === 'email' ? (
                  <Animated.View
                    key="email-step"
                    entering={FadeIn.duration(200)}
                    exiting={SlideOutLeft.duration(200)}
                    className="gap-5"
                  >
                    {/* Email/Phone Toggle */}
                    <View className="flex-row rounded-lg border border-separator p-1 gap-1">
                      <Pressable
                        onPress={() => { setContactMethod('email'); setEmail(''); setEmailError(false); }}
                        className={cn(
                          'flex-1 flex-row items-center justify-center py-2 rounded-md gap-1.5',
                          contactMethod === 'email' && 'bg-accent/10'
                        )}
                      >
                        <StyledFeather
                          name="mail"
                          size={15}
                          className={contactMethod === 'email' ? 'text-accent' : 'text-muted'}
                        />
                        <AppText
                          className={cn(
                            'text-sm font-medium',
                            contactMethod === 'email' ? 'text-accent' : 'text-muted'
                          )}
                        >
                          Email
                        </AppText>
                      </Pressable>
                      <Pressable
                        onPress={() => { setContactMethod('phone'); setEmail(''); setEmailError(false); }}
                        className={cn(
                          'flex-1 flex-row items-center justify-center py-2 rounded-md gap-1.5',
                          contactMethod === 'phone' && 'bg-accent/10'
                        )}
                      >
                        <StyledFeather
                          name="phone"
                          size={15}
                          className={contactMethod === 'phone' ? 'text-accent' : 'text-muted'}
                        />
                        <AppText
                          className={cn(
                            'text-sm font-medium',
                            contactMethod === 'phone' ? 'text-accent' : 'text-muted'
                          )}
                        >
                          Phone
                        </AppText>
                      </Pressable>
                    </View>

                    {/* Input Field */}
                    <View className="gap-1">
                      <View className="relative flex-row">
                        {contactMethod === 'phone' && (
                          <Pressable
                            onPress={() => setShowCountryModal(true)}
                            className="h-12 rounded-l-lg border border-r-0 border-separator bg-background px-3 justify-center flex-row items-center gap-1.5"
                          >
                            <AppText className="text-base">{selectedCountry.flag}</AppText>
                            <AppText className="text-sm text-foreground font-medium">{selectedCountry.dialCode}</AppText>
                            <StyledFeather name="chevron-down" size={14} className="text-muted" />
                          </Pressable>
                        )}
                        <View className="flex-1 relative">
                          {contactMethod === 'email' && (
                            <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                              <StyledFeather name="mail" size={18} className="text-muted" />
                            </View>
                          )}
                          <StyledTextInput
                            value={email}
                            onChangeText={(text: string) => {
                              if (contactMethod === 'phone') {
                                const cleaned = text.replace(/\D/g, '').slice(0, 10);
                                setEmail(cleaned);
                              } else {
                                setEmail(text);
                              }
                              if (emailError) setEmailError(false);
                            }}
                            placeholder={
                              contactMethod === 'email'
                                ? 'Enter your email'
                                : 'Enter phone number'
                            }
                            keyboardType={contactMethod === 'email' ? 'email-address' : 'phone-pad'}
                            autoCapitalize="none"
                            maxLength={contactMethod === 'phone' ? 10 : undefined}
                            className={cn(
                              'h-12 border bg-background pr-4 text-foreground text-base',
                              contactMethod === 'email'
                                ? 'rounded-lg pl-10'
                                : 'rounded-r-lg pl-3',
                              emailError ? 'border-danger' : 'border-separator'
                            )}
                            placeholderTextColor={isDark ? '#666' : '#999'}
                          />
                        </View>
                      </View>
                      {emailError && contactMethod === 'email' && (
                        <AppText className="text-xs text-danger">
                          Please enter a valid email
                        </AppText>
                      )}
                    </View>

                    {/* Send OTP Button */}
                    <Button variant="primary" onPress={handleSendOTP} isDisabled={loading}>
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Button.Label>Send OTP</Button.Label>
                          <StyledFeather name="arrow-right" size={16} className="text-white" />
                        </>
                      )}
                    </Button>

                    {/* Divider + Google Sign In */}
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1 h-px bg-separator" />
                      <AppText className="text-xs text-muted">or</AppText>
                      <View className="flex-1 h-px bg-separator" />
                    </View>
                    <Pressable
                      onPress={handleGoogleSignIn}
                      disabled={loading}
                      className="flex-row items-center justify-center gap-3 h-12 rounded-xl border border-separator bg-background"
                    >
                      <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
                      <AppText className="text-sm font-medium text-foreground">
                        Continue with Google
                      </AppText>
                    </Pressable>
                  </Animated.View>
                ) : (
                  <Animated.View
                    key="otp-step"
                    entering={SlideInRight.duration(200)}
                    exiting={FadeOut.duration(200)}
                    className="gap-5"
                  >
                    {/* OTP Info */}
                    <View className="items-center gap-1">
                      <AppText className="text-sm text-muted">Verification code sent to</AppText>
                      <AppText className="text-base font-medium text-foreground">
                        {email || 'your email'}
                      </AppText>
                    </View>

                    {/* OTP Input */}
                    <View className="items-center">
                      <InputOTP
                        ref={otpRef}
                        maxLength={6}
                        onComplete={handleOTPComplete}
                        onChange={setOtp}
                      >
                        <InputOTP.Group>
                          <InputOTP.Slot index={0} />
                          <InputOTP.Slot index={1} />
                          <InputOTP.Slot index={2} />
                        </InputOTP.Group>
                        <InputOTP.Separator />
                        <InputOTP.Group>
                          <InputOTP.Slot index={3} />
                          <InputOTP.Slot index={4} />
                          <InputOTP.Slot index={5} />
                        </InputOTP.Group>
                      </InputOTP>
                    </View>

                    {/* Verify Button */}
                    <Button
                      variant="primary"
                      onPress={handleVerify}
                      isDisabled={otp.length < 6 || loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Button.Label>Verify & Sign In</Button.Label>
                          <StyledFeather name="arrow-right" size={16} className="text-white" />
                        </>
                      )}
                    </Button>

                    {/* Bottom actions */}
                    <View className="flex-row justify-between">
                      <Pressable
                        onPress={() => {
                          setStep('email');
                          setOtp('');
                          otpRef.current?.clear();
                        }}
                        className="flex-row items-center gap-1"
                      >
                        <StyledFeather name="arrow-left" size={14} className="text-accent" />
                        <AppText className="text-sm text-accent">
                          {contactMethod === 'phone' ? 'Change Phone' : 'Change Email'}
                        </AppText>
                      </Pressable>
                      <Pressable onPress={handleResendOtp} disabled={loading || !canResend}>
                        <AppText className={cn('text-sm', canResend ? 'text-accent' : 'text-muted')}>
                          {canResend
                            ? 'Resend OTP'
                            : `Resend in ${resendTimer}s`}
                        </AppText>
                      </Pressable>
                    </View>
                  </Animated.View>
                )}
              </Surface>
            </Animated.View>

            {/* Legal text */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(200)}
              className="mt-6"
            >
              <AppText className="text-xs text-muted text-center">
                By continuing, you agree to our{' '}
                <AppText className="text-xs text-accent" onPress={() => {}}>
                  Terms of Service
                </AppText>
                {' '}and{' '}
                <AppText
                  className="text-xs text-accent"
                  onPress={() => {}}
                >
                  Privacy Policy
                </AppText>
              </AppText>
              <AppText className="text-xs text-muted text-center mt-2">
                v1.0.0
              </AppText>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selector Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowCountryModal(false);
          setCountrySearch('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1 bg-black/50 justify-end"
        >
          <View
            className="bg-background rounded-t-3xl flex-1"
            style={{ maxHeight: '80%', paddingBottom: insets.bottom + 16 }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-separator">
              <AppText className="text-lg font-semibold text-foreground">
                Select Country
              </AppText>
              <Pressable
                onPress={() => {
                  setShowCountryModal(false);
                  setCountrySearch('');
                }}
                className="h-8 w-8 rounded-full bg-default-100 items-center justify-center"
              >
                <StyledFeather name="x" size={18} className="text-foreground" />
              </Pressable>
            </View>

            {/* Search Bar */}
            <View className="px-5 py-3">
              <View className="flex-row items-center bg-default-100 rounded-xl px-3 h-11">
                <StyledFeather
                  name="search"
                  size={16}
                  className="text-muted mr-2"
                />
                <StyledTextInput
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  placeholder="Search countries..."
                  className="flex-1 text-foreground text-sm"
                  placeholderTextColor="#999"
                  autoFocus
                />
                {countrySearch.length > 0 && (
                  <Pressable onPress={() => setCountrySearch('')}>
                    <StyledFeather
                      name="x-circle"
                      size={16}
                      className="text-muted"
                    />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Countries List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = item.code === selectedCountry.code;
                return (
                  <Pressable
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowCountryModal(false);
                      setCountrySearch('');
                    }}
                    className={cn(
                      'flex-row items-center justify-between py-3.5 px-3 rounded-xl mb-1',
                      isSelected && 'bg-accent/10',
                    )}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <AppText className="text-lg">{item.flag}</AppText>
                      <View className="flex-1">
                        <AppText
                          className={cn(
                            'text-base',
                            isSelected
                              ? 'text-accent font-semibold'
                              : 'text-foreground font-normal',
                          )}
                          numberOfLines={1}
                        >
                          {item.name}
                        </AppText>
                        <AppText className="text-sm text-muted">
                          {item.dialCode}
                        </AppText>
                      </View>
                    </View>
                    {isSelected && (
                      <StyledFeather
                        name="check"
                        size={18}
                        className="text-accent"
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
