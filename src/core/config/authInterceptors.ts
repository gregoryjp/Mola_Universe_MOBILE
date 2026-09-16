import { setAccessTokenProvider, setRefreshHandler } from '@data/api/client';
import { authRepository } from '@data/auth/repositories/AuthRepositoryImpl';
import { useAuthStore } from '@shared/store/authStore';

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

    const { accessToken, refreshToken } = result.value;
    await useAuthStore.getState().updateTokens({ accessToken, refreshToken });
    return accessToken;
  });
};
