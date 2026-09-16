import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  saveSession: vi.fn(),
  loadSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@shared/utils/secureStorage', () => ({
  saveSession: mocks.saveSession,
  loadSession: mocks.loadSession,
  clearSession: mocks.clearSession,
}));

vi.mock('@data/auth/repositories/AuthRepositoryImpl', () => ({
  authRepository: { login: mocks.login },
}));

import { useLogin } from '@presentation/auth/hooks/useLogin';
import { useAuthStore } from '@shared/store/authStore';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' as const };

let captured: ReturnType<typeof useLogin> | undefined;

const Harness = (): null => {
  captured = useLogin();
  return null;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
  useAuthStore.setState({ user: null, session: null, isAuthenticated: false, isHydrated: false });
});

describe('useLogin', () => {
  it('calls the repository and stores the session on success', async () => {
    mocks.login.mockResolvedValueOnce({ success: true, value: { user, tokens } });
    const queryClient = new QueryClient();
    let renderer: ReactTestRenderer | undefined;

    await act(async () => {
      renderer = create(
        <QueryClientProvider client={queryClient}>
          <Harness />
        </QueryClientProvider>,
      );
    });

    await act(async () => {
      captured?.mutate({ email: 'a@b.com', password: 'secret' });
    });

    expect(mocks.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().session?.accessToken).toBe('at');

    renderer?.unmount();
  });
});
