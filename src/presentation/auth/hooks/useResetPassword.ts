import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type {
  AuthError,
  MessageResult,
  ResetPasswordPayload,
} from '@domain/auth/repositories/AuthRepository';
import { useMutation } from '@tanstack/react-query';

export const useResetPassword = () =>
  useMutation<MessageResult, AuthError, ResetPasswordPayload>({
    mutationFn: async (payload) => {
      const result = await authRepository.resetPassword(payload);
      if (!result.success) throw result.error;
      return result.value;
    },
  });
