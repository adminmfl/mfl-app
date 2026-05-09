import axios, { InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';

// Access token is held in-memory only (never persisted to disk)
let accessToken: string | null = null;

export function setInMemoryAccessToken(token: string | null): void {
  accessToken = token;
}

export function getInMemoryAccessToken(): string | null {
  return accessToken;
}

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: inject Bearer token ───
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 with silent refresh ───
// This is wired up by the auth module after initialization.
// See src/core/auth/auth-service.ts for the interceptor setup.
