import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type {
  AuthError,
  RegisterData,
  RegisterPayload,
} from '@domain/auth/repositories/AuthRepository';
import { useAuthStore } from '@shared/store/authStore';
import { useMutation } from '@tanstack/react-query';

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<RegisterData, AuthError, RegisterPayload>({
    mutationFn: async (payload) => {
      const result = await authRepository.register(payload);
      if (!result.success) throw result.error;
      return result.value;
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens);
    },
  });
};
