import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type {
  AuthError,
  MessageResult,
  VerifyOtpPayload,
} from '@domain/auth/repositories/AuthRepository';
import { useAuthStore } from '@shared/store/authStore';
import { useMutation } from '@tanstack/react-query';

/**
 * The backend's `AUTH_ALREADY_VERIFIED` (400) means the goal — a verified
 * email — is already achieved, so it is treated as a success path here rather
 * than surfaced as an error to the caller.
 */
const ALREADY_VERIFIED_CODE = 'AUTH_ALREADY_VERIFIED';

export const useVerifyOtp = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<MessageResult, AuthError, VerifyOtpPayload>({
    mutationFn: async (payload) => {
      const result = await authRepository.verifyOtp(payload);
      if (result.success) return result.value;
      if (result.error.code === ALREADY_VERIFIED_CODE) {
        return { message: result.error.message };
      }
      throw result.error;
    },
    onSuccess: () => {
      updateUser({ emailVerified: true });
    },
  });
};
