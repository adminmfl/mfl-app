import { isAxiosError } from 'axios';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export function getMessagingApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
