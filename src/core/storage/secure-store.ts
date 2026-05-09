import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'mfl_refresh_token';

export async function getSecureRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSecureRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (e) {
    console.error('[secure-store] Failed to save refresh token:', e);
  }
}

export async function clearSecureRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (e) {
    console.error('[secure-store] Failed to clear refresh token:', e);
  }
}
