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

/** All field values for the signup details form. */
export interface SignupFormState {
  email: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | '';
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showDatePicker: boolean;
}

/** All setters and event handlers for the signup details form. */
export interface SignupFormActions {
  onEmailChange: (v: string) => void;
  onUsernameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onGenderChange: (v: Gender) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onToggleDatePicker: () => void;
}
