import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import type { AuthError } from '@domain/auth/repositories/AuthRepository';
import { useAuthStore } from '@shared/store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Logs out for real: revokes the session server-side, then clears local state.
 *
 * `POST /auth/logout` needs the session id captured at login (P0-3). It is
 * best-effort on purpose — the user asked to leave, so an offline device or an
 * already-expired session must still sign out locally instead of trapping them
 * behind a failing request. The mutation therefore never rejects; local cleanup
 * runs in `onSettled` regardless of the server outcome.
 */
export const useLogout = () => {
  const signOut = useAuthStore((state) => state.signOut);
  const queryClient = useQueryClient();

  return useMutation<void, AuthError, void>({
    mutationFn: async () => {
      const { session } = useAuthStore.getState();
      if (session) await authRepository.logout(session.sessionId);
    },
    onSettled: async () => {
      await signOut();
      // Drop every cached query so the next account never sees the previous
      // one's data (all query keys are scoped to the signed-in user/household).
      queryClient.clear();
    },
  });
};
