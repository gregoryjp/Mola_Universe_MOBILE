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
  const setVerificationChallenge = useAuthStore((state) => state.setVerificationChallenge);

  return useMutation<RegisterData, AuthError, RegisterPayload>({
    mutationFn: async (payload) => {
      const result = await authRepository.register(payload);
      if (!result.success) throw result.error;
      return result.value;
    },
    onSuccess: async (data) => {
      // Order matters: `setAuth` flips `isAuthenticated`, which swaps the
      // navigator to the unverified branch — the token must already be in the
      // store before that remount so `VerifyEmailScreen` finds it on mount.
      setVerificationChallenge(data.verificationToken, data.otpExpiresAt ?? null);
      await setAuth(data.user, data.tokens);
    },
  });
};
