import { setAccessTokenProvider, setRefreshHandler } from '@data/api/client';
import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import { setProfileFetcher, useAuthStore } from '@shared/store/authStore';

/**
 * Composition-root wiring. Lets the shared API client read the current access
 * token and transparently refresh it once on a 401 response, then retry the
 * failed call. Keeping this here (not in `shared/` or `data/`) preserves the
 * dependency direction: only `core/` knows about both the store and the client.
 */
export const registerAuthInterceptors = (): void => {
  setAccessTokenProvider(() => useAuthStore.getState().session?.accessToken ?? null);

  setRefreshHandler(async () => {
    const current = useAuthStore.getState().session;
    if (!current) return null;

    const result = await authRepository.refresh(current.refreshToken);
    if (!result.success) {
      await useAuthStore.getState().signOut();
      return null;
    }

    // The backend rotates the session on refresh: persist the new tokens *and*
    // the new session id, or logout would revoke a stale session (P0-3).
    const { accessToken, refreshToken, sessionId } = result.value;
    await useAuthStore.getState().updateTokens({ accessToken, refreshToken, sessionId });
    return accessToken;
  });

  // P0-1: the session is persisted, the user is not. Re-fetch the profile so the
  // store always has a `user` while authenticated, even after a cold start.
  setProfileFetcher(async () => {
    const result = await authRepository.fetchProfile();
    return result.success ? result.value : null;
  });
};
