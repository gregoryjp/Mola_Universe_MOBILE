import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  saveSession: vi.fn(),
  loadSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@shared/utils/secureStorage', () => ({
  saveSession: mocks.saveSession,
  loadSession: mocks.loadSession,
  clearSession: mocks.clearSession,
}));

import { useAuthStore } from '@shared/store/authStore';

const session = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresIn: 900,
  tokenType: 'Bearer' as const,
};
const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    session: null,
    isAuthenticated: false,
    isHydrated: false,
  });
});

describe('useAuthStore', () => {
  it('setAuth persists the session and marks the user authenticated', async () => {
    await useAuthStore.getState().setAuth(user, session);

    expect(mocks.saveSession).toHaveBeenCalledWith(session);
    expect(useAuthStore.getState()).toMatchObject({
      user,
      session,
      isAuthenticated: true,
    });
  });

  it('hydrate restores a stored session', async () => {
    mocks.loadSession.mockResolvedValueOnce(session);

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({
      session,
      isAuthenticated: true,
      isHydrated: true,
    });
  });

  it('hydrate handles the absence of a stored session', async () => {
    mocks.loadSession.mockResolvedValueOnce(null);

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({
      session: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  });

  it('updateTokens swaps tokens and keeps the rest of the session', async () => {
    useAuthStore.setState({ session });

    await useAuthStore.getState().updateTokens({ accessToken: 'new', refreshToken: 'new2' });

    expect(useAuthStore.getState().session).toEqual({
      ...session,
      accessToken: 'new',
      refreshToken: 'new2',
    });
  });

  it('signOut clears storage and state', async () => {
    useAuthStore.setState({ user, session, isAuthenticated: true });

    await useAuthStore.getState().signOut();

    expect(mocks.clearSession).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  });
});
