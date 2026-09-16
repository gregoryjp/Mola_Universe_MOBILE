import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type {
  AuthData,
  AuthError,
  LoginCredentials,
} from '@domain/auth/repositories/AuthRepository';
import { useAuthStore } from '@shared/store/authStore';
import { useMutation } from '@tanstack/react-query';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthData, AuthError, LoginCredentials>({
    mutationFn: async (credentials) => {
      const result = await authRepository.login(credentials);
      if (!result.success) throw result.error;
      return result.value;
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens);
    },
  });
};
