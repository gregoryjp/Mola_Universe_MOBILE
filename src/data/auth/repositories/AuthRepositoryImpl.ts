import { apiClient } from '@data/api/client';
import type { ApiResponse } from '@data/api/types';
import type { TokenPair } from '@domain/auth/entities/Session';
import type {
  AuthData,
  AuthRepository,
  AuthResult,
  ForgotPasswordResult,
  LoginCredentials,
  MessageResult,
  RegisterData,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from '@domain/auth/repositories/AuthRepository';
import type {
  AuthResponseDto,
  ForgotPasswordResponseDto,
  MessageResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from '../dtos/authDtos';
import { toAuthData, toRegisterData, toTokenPair } from '../mappers/authMappers';

const toResult = <TD, T>(response: ApiResponse<TD>, map: (dto: TD) => T): AuthResult<T> => {
  if (response.success && response.data !== undefined) {
    return { success: true, value: map(response.data) };
  }
  return {
    success: false,
    error: {
      code: response.error?.code ?? 'UNKNOWN_ERROR',
      message: response.error?.message ?? 'Unexpected error',
      statusCode: response.error?.statusCode ?? 500,
    },
  };
};

const toMessage = (dto: MessageResponseDto): MessageResult => ({ message: dto.message });

export class AuthRepositoryImpl implements AuthRepository {
  async login({ email, password }: LoginCredentials): Promise<AuthResult<AuthData>> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', { email, password });
    return toResult(response, toAuthData);
  }

  async register(payload: RegisterPayload): Promise<AuthResult<RegisterData>> {
    const response = await apiClient.post<RegisterResponseDto>('/auth/register', payload);
    return toResult(response, toRegisterData);
  }

  async refresh(refreshToken: string): Promise<AuthResult<TokenPair>> {
    const response = await apiClient.post<RefreshResponseDto>('/auth/refresh', { refreshToken });
    return toResult(response, toTokenPair);
  }

  async logout(sessionId: string): Promise<AuthResult<MessageResult>> {
    const response = await apiClient.post<MessageResponseDto>('/auth/logout', { sessionId });
    return toResult(response, toMessage);
  }

  async forgotPassword(email: string): Promise<AuthResult<ForgotPasswordResult>> {
    const response = await apiClient.post<ForgotPasswordResponseDto>('/auth/forgot-password', {
      email,
    });
    return toResult(response, (dto) => ({
      verificationToken: dto.verificationToken,
      message: dto.message,
    }));
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResult<MessageResult>> {
    const response = await apiClient.post<MessageResponseDto>('/auth/reset-password', payload);
    return toResult(response, toMessage);
  }

  async verifyEmail(token: string): Promise<AuthResult<MessageResult>> {
    const response = await apiClient.post<MessageResponseDto>('/auth/verify-email', { token });
    return toResult(response, toMessage);
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResult<MessageResult>> {
    const response = await apiClient.post<MessageResponseDto>('/auth/verify-otp', payload);
    return toResult(response, toMessage);
  }

  async googleLogin(idToken: string): Promise<AuthResult<AuthData>> {
    const response = await apiClient.post<AuthResponseDto>('/auth/google-login', { idToken });
    return toResult(response, toAuthData);
  }

  async appleLogin(idToken: string): Promise<AuthResult<AuthData>> {
    const response = await apiClient.post<AuthResponseDto>('/auth/apple-login', { idToken });
    return toResult(response, toAuthData);
  }
}

export const authRepository: AuthRepository = new AuthRepositoryImpl();
