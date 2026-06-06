import axios, { InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { recordError, log as crashlyticsLog } from '../../lib/crashlytics';
import { createHttpMetric } from '../../lib/performance';

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

// ─── Request interceptor: inject Bearer token + start perf metric ───
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Attach a Firebase Performance HTTP metric to the request config so we can
  // stop it in the response interceptor. We use a custom key to avoid typing
  // conflicts with the standard axios config fields.
  try {
    const url = (config.baseURL ?? '') + (config.url ?? '');
    const method = (config.method ?? 'GET').toUpperCase();
    const metric = createHttpMetric(url, method);
    await metric.start();
    (config as any).__perfMetric = metric;
  } catch {
    // Performance monitoring is non-critical — don't block the request
  }

  return config;
});

// ─── Response interceptor: stop perf metric, log non-fatal API errors ───
// Wiring for 401 silent refresh is set up by auth-service.ts after init.
api.interceptors.response.use(
  async (response) => {
    const metric = (response.config as any).__perfMetric;
    if (metric) {
      try {
        await metric.setHttpResponseCode(response.status);
        await metric.setResponseContentType(
          response.headers['content-type'] ?? 'application/json',
        );
        await metric.stop();
      } catch {
        // ignore perf errors
      }
    }
    return response;
  },
  async (error: any) => {
    const config = error.config;
    const metric = config?.__perfMetric;

    if (metric) {
      try {
        const status = error.response?.status ?? 0;
        await metric.setHttpResponseCode(status);
        await metric.stop();
      } catch {
        // ignore perf errors
      }
    }

    // Log non-fatal errors (4xx/5xx) to Crashlytics, skip 401 which is handled
    // by the auth interceptor and is expected during token refresh flows.
    const status = error.response?.status;
    if (status && status !== 401) {
      const url = config?.url ?? 'unknown';
      const method = (config?.method ?? 'GET').toUpperCase();
      const context = `API ${method} ${url} → HTTP ${status}`;
      const apiError = new Error(
        error.response?.data?.error ?? error.message ?? context,
      );
      apiError.name = 'ApiError';
      crashlyticsLog(context);
      recordError(apiError, context);
    }

    return Promise.reject(error);
  },
);
