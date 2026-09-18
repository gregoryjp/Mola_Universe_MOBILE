import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type { AuthError, ResendVerificationResult } from '@domain/auth/repositories/AuthRepository';
import { useAuthStore } from '@shared/store/authStore';
import { useMutation } from '@tanstack/react-query';

const unavailableChallenge = (): AuthError => ({
  code: 'AUTH_VERIFICATION_UNAVAILABLE',
  message: 'A new verification challenge was not available.',
  statusCode: 409,
});

export const useResendVerification = () => {
  const setVerificationChallenge = useAuthStore((state) => state.setVerificationChallenge);

  return useMutation<ResendVerificationResult, AuthError, string>({
    mutationFn: async (email) => {
      const result = await authRepository.resendVerification(email);
      if (!result.success) throw result.error;

      const { verificationToken, otpExpiresAt } = result.value;
      if (!verificationToken || !otpExpiresAt || Number.isNaN(Date.parse(otpExpiresAt))) {
        // The endpoint intentionally returns a successful, non-leaking shape
        // for unavailable accounts. That response cannot drive this signed-in
        // verification flow, so do not present it as a successful resend.
        throw unavailableChallenge();
      }

      return result.value;
    },
    onSuccess: (data) => {
      setVerificationChallenge(data.verificationToken, data.otpExpiresAt ?? null);
    },
  });
};
