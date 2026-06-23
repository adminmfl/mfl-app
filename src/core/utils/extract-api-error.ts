import type { ApiError } from '../types/api-error';

/**
 * Extracts a user-facing error message from an API error.
 * Falls back to the provided fallback string when no message is available.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const typed = err as ApiError & { message?: string };
  return typed?.response?.data?.error ?? typed?.message ?? fallback;
}
