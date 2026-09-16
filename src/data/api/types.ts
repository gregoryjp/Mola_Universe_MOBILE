export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  requestId?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
}
