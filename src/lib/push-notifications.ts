import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      // Foreground notifications are surfaced through the in-app toast layer.
      shouldShowAlert: false,
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
