import { useMutation, useQuery } from '@tanstack/react-query';
import { useSessionStore } from '../../../shared/auth/secure-session-store';
import { apiClient, ApiClientError } from '../../../shared/api/api-client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOTPRequest,
  User,
} from '../interface/types';

const AUTH_QUERY_KEY = 'auth';

async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
}

async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
}

async function logoutUser(): Promise<void> {
  await useSessionStore.getState().clearTokens();
}

async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await apiClient.post('/auth/forgot-password', data);
}

async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await apiClient.post('/auth/reset-password', data);
}

async function verifyOTP(data: VerifyOTPRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/verify-otp', data);
  return response.data;
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await useSessionStore.getState().getAccessToken();
    if (!token) return null;

    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
}

export function useAuth() {
  const sessionStore = useSessionStore();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await sessionStore.setTokens(
        data.tokens.accessToken,
        data.tokens.refreshToken,
        data.user.id
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      await sessionStore.setTokens(
        data.tokens.accessToken,
        data.tokens.refreshToken,
        data.user.id
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
  });

  const verifyOTPMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: async (data) => {
      await sessionStore.setTokens(
        data.tokens.accessToken,
        data.tokens.refreshToken,
        data.user.id
      );
    },
  });

  const currentUserQuery = useQuery({
    queryKey: [AUTH_QUERY_KEY, 'current-user'],
    queryFn: getCurrentUser,
    enabled: sessionStore.isHydrated && !!sessionStore.accessToken,
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
    verifyOTP: verifyOTPMutation,
    currentUser: currentUserQuery,
    isAuthenticated: !!sessionStore.accessToken,
    user: currentUserQuery.data,
  };
}
