import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authService from './auth-service';
import { setInMemoryAccessToken, getInMemoryAccessToken } from '../api/client';
import { getSecureRefreshToken } from '../storage/secure-store';
import { getCachedUser, clearCachedUser } from '../storage/mmkv';
import type { AuthUser, LoginRequest, GoogleLoginRequest, AuthState } from './auth-types';
import { deregisterToken, registerToken } from '../../hooks/usePushNotifications';

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
  const userRef = useRef<AuthUser | null>(null);

  // Force logout handler (called by 401 interceptor when refresh fails)
  const forceLogout = useCallback(() => {
    const currentUserId = userRef.current?.id ?? null;
    if (currentUserId) {
      void deregisterToken(currentUserId);
    }

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

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void registerToken(user.id);
  }, [user?.id]);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.loginWithEmail(data);
    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (data: GoogleLoginRequest) => {
    const response = await authService.loginWithGoogle(data);
    setUser(response.user);
    return { isNewUser: response.isNewUser };
  }, []);

  const logout = useCallback(async () => {
    const currentUserId = userRef.current?.id ?? null;
    if (currentUserId) {
      await deregisterToken(currentUserId);
    }

    await authService.logout();
    setUser(null);
    queryClient.clear();
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
