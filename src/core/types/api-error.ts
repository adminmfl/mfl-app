export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}
