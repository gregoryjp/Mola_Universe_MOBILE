import type { ApiResponse } from './types';

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
export const setRefreshHandler = (handler: RefreshHandler): void => {
  refreshHandler = handler;
};

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
  isRetry = false,
): Promise<ApiResponse<T>> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const token = accessTokenProvider();
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 401 && !isRetry && refreshHandler) {
      const refreshedToken = await refreshHandler();
      if (refreshedToken) {
        return request<T>(method, path, body, true);
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

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
