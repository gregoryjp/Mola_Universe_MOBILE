import type { ApiError, ApiResponse } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 10_000);

type AccessTokenProvider = () => string | null;
type RefreshHandler = () => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider = () => null;
let refreshHandler: RefreshHandler | null = null;

/** Registered by the composition root (src/core/config/authInterceptors.ts). */
export const setAccessTokenProvider = (provider: AccessTokenProvider): void => {
  accessTokenProvider = provider;
};

/** Registered by the composition root; returns the new access token or null. */
export const setRefreshHandler = (handler: RefreshHandler | null): void => {
  refreshHandler = handler;
};

/**
 * Result for endpoints whose body is NOT wrapped in the `{ success, data }`
 * envelope — e.g. Tasks and Dashboard, whose controllers `res.json(data)`
 * directly. Errors still arrive as the envelope, so we normalise them here.
 */
export type RawResult<T> =
  | { success: true; status: number; data: T }
  | { success: false; status: number; error: ApiError };

const buildHeaders = (token: string | null): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
  isRetry = false,
  tokenOverride?: string,
): Promise<ApiResponse<T>> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const token = tokenOverride ?? accessTokenProvider();
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 401 && !isRetry && refreshHandler) {
      const refreshedToken = await refreshHandler();
      if (refreshedToken) {
        return request<T>(method, path, body, true, refreshedToken);
      }
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: String(error) },
    };
  } finally {
    clearTimeout(timeout);
  }
};

const rawRequest = async <T>(
  method: string,
  path: string,
  body?: unknown,
  isRetry = false,
  tokenOverride?: string,
): Promise<RawResult<T>> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const token = tokenOverride ?? accessTokenProvider();
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 401 && !isRetry && refreshHandler) {
      const refreshedToken = await refreshHandler();
      if (refreshedToken) {
        return rawRequest<T>(method, path, body, true, refreshedToken);
      }
    }

    if (response.status === 204) {
      return { success: true, status: response.status, data: undefined as T };
    }

    const parsed = (await response.json()) as unknown;
    if (!response.ok) {
      const envelope = parsed as ApiResponse<unknown>;
      return {
        success: false,
        status: response.status,
        error: {
          code: envelope.error?.code ?? 'UNKNOWN_ERROR',
          message: envelope.error?.message ?? 'Unexpected error',
          statusCode: envelope.error?.statusCode ?? response.status,
        },
      };
    }
    return { success: true, status: response.status, data: parsed as T };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: { code: 'NETWORK_ERROR', message: String(error) },
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const apiClient = {
  // Enveloped endpoints (Auth): response is `{ success, data, timestamp }`.
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),

  // Raw endpoints (Tasks, Dashboard): success body is the resource itself.
  getRaw: <T>(path: string) => rawRequest<T>('GET', path),
  postRaw: <T>(path: string, body?: unknown) => rawRequest<T>('POST', path, body),
  patchRaw: <T>(path: string, body?: unknown) => rawRequest<T>('PATCH', path, body),
  deleteRaw: <T>(path: string) => rawRequest<T>('DELETE', path),
};
