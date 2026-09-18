import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type { ApiResponse } from '@data/api/types';
import type { RefreshedSession } from '@domain/auth/entities/Session';
import type { User } from '@domain/auth/entities/User';
import type {
  AuthData,
  AuthRepository,
  AuthResult,
  ForgotPasswordResult,
  LoginCredentials,
  MessageResult,
  RegisterData,
  RegisterPayload,
  ResendVerificationResult,
  ResetPasswordPayload,
  UpdateProfilePayload,
  VerifyOtpPayload,
} from '@domain/auth/repositories/AuthRepository';
import type {
  AuthResponseDto,
  ForgotPasswordResponseDto,
  MessageResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
  ResendVerificationResponseDto,
  UserProfileDto,
} from '../dtos/authDtos';
import { toAuthData, toProfileUser, toRegisterData, toTokenPair } from '../mappers/authMappers';

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

// Raw endpoints (no `{ success, data }` envelope) still deliver errors enveloped,
// so the raw error is normalised to the same domain shape as `toResult`.
const fromRaw = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): AuthResult<T> =>
  raw.success
    ? { success: true, value: map(raw.data) }
    : {
        success: false,
        error: {
          code: raw.error.code,
          message: raw.error.message,
          statusCode: raw.error.statusCode ?? raw.status,
        },
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

  async refresh(refreshToken: string): Promise<AuthResult<RefreshedSession>> {
    const response = await apiClient.post<RefreshResponseDto>('/auth/refresh', { refreshToken });
    return toResult(response, toTokenPair);
  }

  async logout(sessionId: string): Promise<AuthResult<MessageResult>> {
    const response = await apiClient.post<MessageResponseDto>('/auth/logout', { sessionId });
    return toResult(response, toMessage);
  }

  async fetchProfile(): Promise<AuthResult<User>> {
    const raw = await apiClient.getRaw<UserProfileDto>('/users/me');
    return fromRaw(raw, toProfileUser);
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthResult<User>> {
    const raw = await apiClient.patchRaw<UserProfileDto>('/users/me', payload);
    return fromRaw(raw, toProfileUser);
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

  async resendVerification(email: string): Promise<AuthResult<ResendVerificationResult>> {
    const response = await apiClient.post<ResendVerificationResponseDto>(
      '/auth/resend-verification',
      { email },
    );
    return toResult(response, (dto) => ({
      verificationToken: dto.verificationToken,
      otpExpiresAt: dto.otpExpiresAt,
      otpExpiresIn: dto.otpExpiresIn,
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
