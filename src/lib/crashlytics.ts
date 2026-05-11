// Firebase Crashlytics — commented out for demo (requires google-services.json / GoogleService-Info.plist)
// import crashlytics from '@react-native-firebase/crashlytics';

/* eslint-disable @typescript-eslint/no-unused-vars */

export function log(_message: string): void {
  // crashlytics().log(message);
}

export function recordError(_error: Error, _context?: string): void {
  // if (context) crashlytics().log(context);
  // crashlytics().recordError(error);
}

export function setUser(_userId: string): void {
  // crashlytics().setUserId(userId);
}

export function clearUser(): void {
  // crashlytics().setUserId('');
}

export function setAttribute(_key: string, _value: string): void {
  // crashlytics().setAttribute(key, value);
}

export async function initCrashReporting(): Promise<void> {
  // await crashlytics().setCrashlyticsCollectionEnabled(true);
}
