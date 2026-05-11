import { mmkv, removeMMKVKey } from '../core/storage/mmkv';

export const storage = {
  getString(key: string): string | undefined {
    return mmkv.getString(key);
  },
  set(key: string, value: string): void {
    mmkv.set(key, value);
  },
  delete(key: string): void {
    removeMMKVKey(key);
  },
  contains(key: string): boolean {
    return mmkv.contains(key);
  },
  clearAll(): void {
    mmkv.clearAll();
  },
};

// ─── Token Storage ───

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getAccessToken(): string | null {
  return storage.getString(ACCESS_TOKEN_KEY) ?? null;
}

export function setAccessToken(token: string): void {
  storage.set(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return storage.getString(REFRESH_TOKEN_KEY) ?? null;
}

export function setRefreshToken(token: string): void {
  storage.set(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  storage.delete(ACCESS_TOKEN_KEY);
  storage.delete(REFRESH_TOKEN_KEY);
}
