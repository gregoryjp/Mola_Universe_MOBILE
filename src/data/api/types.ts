/** Error shape emitted by the backend (ADR-0010). */
export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
}

/**
 * Envelope returned by every backend endpoint (ADR-0003):
 * `{ success: true, data, timestamp }` on success and
 * `{ success: false, error, timestamp }` on failure.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp?: string;
}
