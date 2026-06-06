import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '../core/api/client';
import { setupNotificationChannel } from '../lib/push-notifications';
import type { PushTokenPlatform } from '../types/database';

interface PushTokenPayload {
  token: string;
  platform: PushTokenPlatform;
}

async function getCurrentDeviceToken(): Promise<PushTokenPayload | null> {
  try {
    if (!Device.isDevice) {
      console.log('[PushNotifications] Push notifications require a physical device.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushNotifications] Notification permissions were not granted.');
      return null;
    }

    await setupNotificationChannel();

    const pushToken = await Notifications.getDevicePushTokenAsync();

    return {
      token: pushToken.data,
      platform: Platform.OS as PushTokenPlatform,
    };
  } catch (error) {
    console.log('[PushNotifications] Failed to obtain device push token.', error);
    return null;
  }
}

export async function registerToken(userId: string): Promise<void> {
  try {
    const tokenData = await getCurrentDeviceToken();
    if (!tokenData) {
      return;
    }

    await api.post('/api/notifications/push-tokens', {
      userId,
      token: tokenData.token,
      platform: tokenData.platform,
    });

    console.log('[PushNotifications] Registered device token for user:', userId);
  } catch (error) {
    console.log('[PushNotifications] Failed to register device token.', error);
  }
}

export async function deregisterToken(userId: string): Promise<void> {
  try {
    const tokenData = await getCurrentDeviceToken();
    if (!tokenData) {
      return;
    }

    await api.delete('/api/notifications/push-tokens', {
      data: {
        userId,
        token: tokenData.token,
      },
    });

    console.log('[PushNotifications] Deregistered device token for user:', userId);
  } catch (error) {
    console.log('[PushNotifications] Failed to deregister device token.', error);
  }
}
