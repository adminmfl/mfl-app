import crashlytics from '@react-native-firebase/crashlytics';

export function reportError(error: unknown): void {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  crashlytics().recordError(normalizedError);
}
