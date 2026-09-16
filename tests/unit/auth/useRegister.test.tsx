import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
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
  authRepository: { register: mocks.register },
}));

import { useRegister } from '@presentation/auth/hooks/useRegister';
import { useAuthStore } from '@shared/store/authStore';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' as const };

let captured: ReturnType<typeof useRegister> | undefined;

const Harness = (): null => {
  captured = useRegister();
  return null;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
  useAuthStore.setState({ user: null, session: null, isAuthenticated: false, isHydrated: false });
});

describe('useRegister', () => {
  it('registers, stores the session and exposes the verification token', async () => {
    mocks.register.mockResolvedValueOnce({
      success: true,
      value: { user, tokens, verificationToken: 'challenge' },
    });
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
      captured?.mutate({
        email: 'a@b.com',
        name: 'Ada',
        password: 'secret',
        passwordConfirm: 'secret',
      });
    });

    expect(mocks.register).toHaveBeenCalledWith({
      email: 'a@b.com',
      name: 'Ada',
      password: 'secret',
      passwordConfirm: 'secret',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(captured?.data?.verificationToken).toBe('challenge');

    renderer?.unmount();
  });
});
