import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { mmkv, removeMMKVKey } from '../core/storage/mmkv';

const FCM_TOKEN_KEY = 'mfl_push_token';

let tokenListener: Notifications.Subscription | null = null;
let notificationListener: Notifications.Subscription | null = null;
let responseListener: Notifications.Subscription | null = null;

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  await setupNotificationChannel();

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const tokenData = token.data;

  // Persist the token locally
  mmkv.set(FCM_TOKEN_KEY, tokenData);

  return tokenData;
}

export function getStoredFcmToken(): string | null {
  return mmkv.getString(FCM_TOKEN_KEY) ?? null;
}

export function clearStoredFcmToken(): void {
  removeMMKVKey(FCM_TOKEN_KEY);
}

export function setupPushListeners(onTokenRefresh?: (token: string) => void): void {
  // Listen for token changes
  tokenListener = Notifications.addPushTokenListener((event: any) => {
    const newToken = event.data as string;
    mmkv.set(FCM_TOKEN_KEY, newToken);
    onTokenRefresh?.(newToken);
  });

  // Listen for incoming notifications while app is foregrounded
  notificationListener = Notifications.addNotificationReceivedListener((_notification: any) => {
    // Notification received in foreground — handler above controls display
  });

  // Listen for user tapping on a notification
  responseListener = Notifications.addNotificationResponseReceivedListener((_response: any) => {
    // Could navigate based on response.notification.request.content.data
  });
}

export function removePushListeners(): void {
  if (tokenListener) {
    tokenListener.remove();
    tokenListener = null;
  }
  if (notificationListener) {
    notificationListener.remove();
    notificationListener = null;
  }
  if (responseListener) {
    responseListener.remove();
    responseListener = null;
  }
}
