// Stub push notifications — not supported in Expo Go.
// TODO: Wire up expo-notifications once using a dev build.

export function setupNotificationHandler(): void {}
export async function setupNotificationChannel(): Promise<void> {}
export async function registerForPushNotifications(): Promise<string | null> {
  return null
}
export function getStoredFcmToken(): string | null {
  return null
}
export function clearStoredFcmToken(): void {}
export function setupPushListeners(_onTokenRefresh?: (token: string) => void): void {}
export function removePushListeners(): void {}
