import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authService from './auth-service';
import { setInMemoryAccessToken, getInMemoryAccessToken } from '../api/client';
import { getSecureRefreshToken } from '../storage/secure-store';
import { getCachedUser, clearCachedUser } from '../storage/mmkv';
import type { AuthUser, LoginRequest, GoogleLoginRequest, AuthState } from './auth-types';
import { logUserLogin, logUserSignUp, setUser as analyticsSetUser } from '../../lib/analytics';
import { setUser as crashlyticsSetUser, clearUser as crashlyticsClearUser } from '../../lib/crashlytics';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginRequest) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  // Force logout handler (called by 401 interceptor when refresh fails)
  const forceLogout = useCallback(() => {
    setUser(null);
    setInMemoryAccessToken(null);
    clearCachedUser();
    queryClient.clear();
  }, [queryClient]);

  // Initialize: restore session from secure storage
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Wire up the 401 interceptor
    authService.setupAuthInterceptor(forceLogout);

    (async () => {
      try {
        const refreshToken = await getSecureRefreshToken();
        if (!refreshToken) {
          setIsLoading(false);
          return;
        }

        // Try to restore from cache first for instant UI
        const cached = getCachedUser<AuthUser>();
        if (cached) {
          setUser(cached);
        }

        // Then do a silent refresh to get a fresh access token
        setIsRefreshing(true);
        const response = await authService.refreshTokens();
        setUser(response.user);
        setIsRefreshing(false);
      } catch {
        // Refresh failed — clear everything
        forceLogout();
        setIsRefreshing(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [forceLogout]);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.loginWithEmail(data);
    setUser(response.user);
    // Track login event and set user identity in Analytics + Crashlytics
    logUserLogin('email').catch(() => {});
    analyticsSetUser(response.user.id).catch(() => {});
    crashlyticsSetUser(response.user.id);
  }, []);

  const loginWithGoogle = useCallback(async (data: GoogleLoginRequest) => {
    const response = await authService.loginWithGoogle(data);
    setUser(response.user);
    // Track signup vs login and set user identity
    if (response.isNewUser) {
      logUserSignUp('google').catch(() => {});
    } else {
      logUserLogin('google').catch(() => {});
    }
    analyticsSetUser(response.user.id).catch(() => {});
    crashlyticsSetUser(response.user.id);
    return { isNewUser: response.isNewUser };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    queryClient.clear();
    // Clear user identity from Analytics + Crashlytics on logout
    analyticsSetUser('').catch(() => {});
    crashlyticsClearUser();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getInMemoryAccessToken(),
        isLoading,
        isRefreshing,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
