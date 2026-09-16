import type { Session } from '@domain/auth/entities/Session';
import type { User } from '@domain/auth/entities/User';
import { clearSession, loadSession, saveSession } from '@shared/utils/secureStorage';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /** Called after a successful login/register/OAuth flow. */
  setAuth: (user: User, session: Session) => Promise<void>;
  /** Swaps tokens after a refresh, keeping the rest of the session intact. */
  updateTokens: (tokens: Pick<Session, 'accessToken' | 'refreshToken'>) => Promise<void>;
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
  updateTokens: async ({ accessToken, refreshToken }) => {
    const current = get().session;
    if (!current) return;
    const session: Session = { ...current, accessToken, refreshToken };
    await saveSession(session);
    set({ session });
  },
  hydrate: async () => {
    const session = await loadSession();
    set({ session, isAuthenticated: session !== null, isHydrated: true });
  },
  signOut: async () => {
    await clearSession();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
