// Stub crashlytics — console logs in dev / Expo Go.
// TODO: Wire up Firebase Crashlytics once using a dev build.

export function log(message: string) {
  if (__DEV__) console.log(`[Crashlytics] ${message}`)
}

export function recordError(error: unknown, context?: string) {
  if (__DEV__) console.error(`[Crashlytics] ${context ?? 'Error'}:`, error)
}

export function setUser(_userId: string) {}
export function clearUser() {}
export function setAttribute(_key: string, _value: string) {}
export function initCrashReporting() {}
