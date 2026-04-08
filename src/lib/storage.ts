// Simple synchronous in-memory storage with same API as MMKV.
// Works in Expo Go without native modules. Data persists for the app session.
// TODO: Replace with react-native-mmkv once using a dev build.

const store = new Map<string, string>()

export const storage = {
  getString(key: string): string | undefined {
    return store.get(key)
  },
  set(key: string, value: string): void {
    store.set(key, value)
  },
  delete(key: string): void {
    store.delete(key)
  },
  contains(key: string): boolean {
    return store.has(key)
  },
  clearAll(): void {
    store.clear()
  },
}

// ─── Token Storage ───

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getAccessToken(): string | null {
  return storage.getString(ACCESS_TOKEN_KEY) ?? null
}

export function setAccessToken(token: string): void {
  storage.set(ACCESS_TOKEN_KEY, token)
}

export function getRefreshToken(): string | null {
  return storage.getString(REFRESH_TOKEN_KEY) ?? null
}

export function setRefreshToken(token: string): void {
  storage.set(REFRESH_TOKEN_KEY, token)
}

export function clearTokens(): void {
  storage.delete(ACCESS_TOKEN_KEY)
  storage.delete(REFRESH_TOKEN_KEY)
}
