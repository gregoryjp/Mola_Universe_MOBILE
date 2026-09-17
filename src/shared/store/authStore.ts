import type { Session } from '@domain/auth/entities/Session';
import type { User } from '@domain/auth/entities/User';
import { clearSession, loadSession, saveSession } from '@shared/utils/secureStorage';
import { create } from 'zustand';

/**
 * Injected by the composition root (`src/core/config/authInterceptors.ts`), the
 * same way the API client receives its token provider. The store must not import
 * the data layer, so the profile fetch that repopulates `user` on a cold start
 * (P0-1) arrives as a callback and `hydrate` stays free of `@data`.
 */
type ProfileFetcher = () => Promise<User | null>;
let profileFetcher: ProfileFetcher | null = null;

export const setProfileFetcher = (fetcher: ProfileFetcher | null): void => {
  profileFetcher = fetcher;
};

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /** Called after a successful login/register/OAuth flow. */
  setAuth: (user: User, session: Session) => Promise<void>;
  /** Swaps tokens (and the rotated session id) after a refresh. */
  updateTokens: (
    tokens: Pick<Session, 'accessToken' | 'refreshToken' | 'sessionId'>,
  ) => Promise<void>;
  /** Rehydrates the session from secure storage on app start. */
  hydrate: () => Promise<void>;
  /** Clears local state + persisted session (does not call the backend). */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isHydrated: false,
  setAuth: async (user, session) => {
    await saveSession(session);
    set({ user, session, isAuthenticated: true });
  },
  updateTokens: async ({ accessToken, refreshToken, sessionId }) => {
    const current = get().session;
    if (!current) return;
    const session: Session = { ...current, accessToken, refreshToken, sessionId };
    await saveSession(session);
    set({ session });
  },
  hydrate: async () => {
    const session = await loadSession();
    // Only the session is persisted; `isHydrated` flips before the profile call
    // so hydration never blocks on the network.
    set({ session, isAuthenticated: session !== null, isHydrated: true });
    if (session && profileFetcher) {
      const user = await profileFetcher();
      // P0-1: without this, a cold start left `user` null while authenticated,
      // which broke ownership checks (e.g. MomentDetailScreen reads `user.id`).
      // Commit only if the same session is still active — a sign-out or a new
      // login during the fetch must win.
      if (user && get().session === session) set({ user });
    }
  },
  signOut: async () => {
    await clearSession();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
