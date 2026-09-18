import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
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
  authRepository: { verifyOtp: mocks.verifyOtp },
}));

import { useVerifyOtp } from '@presentation/auth/hooks/useVerifyOtp';
import { useAuthStore } from '@shared/store/authStore';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

let captured: ReturnType<typeof useVerifyOtp> | undefined;

const Harness = (): null => {
  captured = useVerifyOtp();
  return null;
};

const settle = async (predicate: () => boolean): Promise<void> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await act(async () => {
      await flushQueries();
    });
  }
};

const renderHarness = async (): Promise<ReactTestRenderer> => {
  const queryClient = new QueryClient();
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
  useAuthStore.setState({
    user,
    session: null,
    isAuthenticated: true,
    isHydrated: true,
    verificationToken: 'challenge',
  });
});

describe('useVerifyOtp', () => {
  it('marks the user verified on a successful code', async () => {
    mocks.verifyOtp.mockResolvedValueOnce({ success: true, value: { message: 'Verified' } });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate({ verificationToken: 'challenge', code: '123456' });
    });

    await settle(() => useAuthStore.getState().user?.emailVerified === true);

    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      verificationToken: 'challenge',
      code: '123456',
    });
    expect(useAuthStore.getState().user?.emailVerified).toBe(true);

    renderer.unmount();
  });

  it('treats AUTH_ALREADY_VERIFIED as success instead of surfacing it as an error', async () => {
    mocks.verifyOtp.mockResolvedValueOnce({
      success: false,
      error: { code: 'AUTH_ALREADY_VERIFIED', message: 'Already verified', statusCode: 400 },
    });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate({ verificationToken: 'challenge', code: '123456' });
    });

    await settle(() => useAuthStore.getState().user?.emailVerified === true);

    expect(captured?.isError).toBe(false);
    expect(useAuthStore.getState().user?.emailVerified).toBe(true);

    renderer.unmount();
  });

  it('surfaces a wrong-code error without touching emailVerified', async () => {
    mocks.verifyOtp.mockResolvedValueOnce({
      success: false,
      error: {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        statusCode: 401,
      },
    });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate({ verificationToken: 'challenge', code: '000000' });
    });

    await settle(() => captured?.isError === true);

    expect(captured?.error?.code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(useAuthStore.getState().user?.emailVerified).toBe(false);

    renderer.unmount();
  });
});
