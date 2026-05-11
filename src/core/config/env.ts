import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    (extra.apiBaseUrl as string) ||
    'https://dev.myfitnessleague.com',
  GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    (extra.googleWebClientId as string) ||
    '',
  RAZORPAY_KEY_ID:
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
    '',
} as const;
