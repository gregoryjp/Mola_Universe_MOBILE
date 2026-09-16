import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type { AuthError, ForgotPasswordResult } from '@domain/auth/repositories/AuthRepository';
import { useMutation } from '@tanstack/react-query';

export const useForgotPassword = () =>
  useMutation<ForgotPasswordResult, AuthError, string>({
    mutationFn: async (email) => {
      const result = await authRepository.forgotPassword(email);
      if (!result.success) throw result.error;
      return result.value;
    },
  });
