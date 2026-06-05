import { createMMKV } from 'react-native-mmkv';

export const mmkv = createMMKV({ id: 'mfl-app-storage' });

// ─── Typed helpers for common keys ───

const USER_CACHE_KEY = 'mfl_user_cache';

export function getCachedUser<T>(): T | null {
  const raw = mmkv.getString(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedUser(user: object): void {
  mmkv.set(USER_CACHE_KEY, JSON.stringify(user));
}

export function removeMMKVKey(key: string): void {
  const storage = mmkv as unknown as {
    remove?: (key: string) => boolean;
    delete?: (key: string) => boolean;
  };

  if (typeof storage.remove === 'function') {
    storage.remove(key);
    return;
  }

  storage.delete?.(key);
}

export function clearCachedUser(): void {
  removeMMKVKey(USER_CACHE_KEY);
}
