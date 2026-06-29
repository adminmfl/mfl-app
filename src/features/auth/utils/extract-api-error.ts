import type { ApiRequestError } from '../types';

/**
 * Extracts a user-facing error message from an API error.
 * Checks data.error, then data.message, then typed.message, then falls back.
 * Uses || so empty strings fall through to the next option.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const typed = err as ApiRequestError & { message?: string };
  return (
    typed?.response?.data?.error ||
    typed?.response?.data?.message ||
    typed?.message ||
    fallback
  );
}
