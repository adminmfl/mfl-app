export interface AuthUser {
  id: string;
  email: string;
  platform_role: 'admin' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser & { source: 'mobile' };
}

export interface LoginResponse extends AuthTokenResponse {}

export interface GoogleLoginResponse extends AuthTokenResponse {
  isNewUser: boolean;
}

export interface RefreshResponse extends AuthTokenResponse {}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
}
