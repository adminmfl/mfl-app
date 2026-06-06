import crashlytics from '@react-native-firebase/crashlytics';

export function log(message: string): void {
  crashlytics().log(message);
}

export function recordError(error: Error, context?: string): void {
  if (context) crashlytics().log(context);
  crashlytics().recordError(error);
}

export function setUser(userId: string): void {
  crashlytics().setUserId(userId);
}

export function clearUser(): void {
  crashlytics().setUserId('');
}

export function setAttribute(key: string, value: string): void {
  crashlytics().setAttribute(key, value);
}

export async function initCrashReporting(): Promise<void> {
  await crashlytics().setCrashlyticsCollectionEnabled(true);
}
