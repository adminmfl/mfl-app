import { api, setInMemoryAccessToken } from '../api/client';
import {
  getSecureRefreshToken,
  setSecureRefreshToken,
  clearSecureRefreshToken,
} from '../storage/secure-store';
import {
  setCachedUser,
  clearCachedUser,
  removeMMKVKey,
} from '../storage/mmkv';
import type {
  LoginRequest,
  GoogleLoginRequest,
  LoginResponse,
  GoogleLoginResponse,
  RefreshResponse,
  AuthUser,
} from './auth-types';

// ─── Auth API calls ───

export async function loginWithEmail(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/mobile/login', data);
  await persistTokens(res.data);
  return res.data;
}

export async function loginWithGoogle(data: GoogleLoginRequest): Promise<GoogleLoginResponse> {
  const res = await api.post<GoogleLoginResponse>('/api/auth/mobile/google', data);
  await persistTokens(res.data);
  return res.data;
}

export async function refreshTokens(): Promise<RefreshResponse> {
  const refreshToken = await getSecureRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Use a fresh axios instance to avoid interceptor loops
  const res = await api.post<RefreshResponse>(
    '/api/auth/mobile/refresh',
    { refreshToken },
    {
      // Skip the auth interceptor for this request
      headers: { Authorization: undefined },
      // Mark to skip retry interceptor
      _skipAuthRetry: true,
    } as any
  );

  await persistTokens(res.data);
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = await getSecureRefreshToken();
    if (refreshToken) {
      await api.post('/api/auth/mobile/logout', { refreshToken }).catch(() => {});
    }
  } finally {
    setInMemoryAccessToken(null);
    await clearSecureRefreshToken();
    clearCachedUser();
    removeMMKVKey('mfl_active_league');
  }
}

// ─── Internal helpers ───

async function persistTokens(data: { accessToken: string; refreshToken: string; user: AuthUser }): Promise<void> {
  setInMemoryAccessToken(data.accessToken);
  await setSecureRefreshToken(data.refreshToken);
  setCachedUser(data.user);
}

// ─── 401 Interceptor Setup ───
// Call this once during app initialization

let interceptorId: number | null = null;

export function setupAuthInterceptor(onForceLogout: () => void): void {
  if (interceptorId !== null) {
    api.interceptors.response.eject(interceptorId);
  }

  interceptorId = api.interceptors.response.use(
    (response) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest?._retried &&
        !originalRequest?._skipAuthRetry
      ) {
        originalRequest._retried = true;
        try {
          const { accessToken } = await refreshTokens();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — force logout
          onForceLogout();
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
}
