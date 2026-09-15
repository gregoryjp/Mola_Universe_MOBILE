import axios, { AxiosInstance, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { useSessionStore } from '../auth/secure-session-store';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
let refreshPromise: Promise<string | null> | null = null;

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

class ApiClientError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: config.API_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(async (config) => {
    const requestId = uuidv4();
    config.headers['X-Request-ID'] = requestId;
    config.headers['X-Idempotency-Key'] = requestId;

    const token = await useSessionStore.getState().getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalConfig = error.config as any;

      if (error.response?.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken();
          }

          const newToken = await refreshPromise;
          refreshPromise = null;

          if (newToken) {
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalConfig);
          } else {
            await useSessionStore.getState().clearTokens();
          }
        } catch (refreshError) {
          await useSessionStore.getState().clearTokens();
          return Promise.reject(refreshError);
        }
      }

      const statusCode = error.response?.status || 0;
      const errorData = error.response?.data as ApiErrorResponse;
      const message = errorData?.error?.message || error.message;
      const code = errorData?.error?.code || 'UNKNOWN_ERROR';
      const details = errorData?.error?.details;

      return Promise.reject(
        new ApiClientError(code, statusCode, message, details)
      );
    }
  );

  return instance;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await useSessionStore.getState().getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(`${config.API_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
    await useSessionStore.getState().setTokens(accessToken, newRefreshToken, user.id);

    return accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

export const apiClient = createApiClient();
export { ApiClientError };
