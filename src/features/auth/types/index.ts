/**
 * Shared types for auth feature API responses and error handling.
 */

/** Shape of error responses from the MFL web API. */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/** Axios-shaped error with a typed response body. */
export interface ApiRequestError {
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
}

/** Gender values accepted by the MFL API. */
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
