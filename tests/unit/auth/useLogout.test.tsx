import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
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
  authRepository: { logout: mocks.logout },
}));

import { useLogout } from '@presentation/auth/hooks/useLogout';
import { useAuthStore } from '@shared/store/authStore';

const session = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresIn: 900,
  tokenType: 'Bearer' as const,
  sessionId: 's1',
};

let captured: ReturnType<typeof useLogout> | undefined;
let queryClient: QueryClient;

const Harness = (): null => {
  captured = useLogout();
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

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
  queryClient = new QueryClient();
  useAuthStore.setState({ user: null, session, isAuthenticated: true, isHydrated: true });
});

const renderHarness = async (): Promise<ReactTestRenderer> => {
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  return renderer as ReactTestRenderer;
};

describe('useLogout', () => {
  it('revokes the server session with the stored session id, then clears local state', async () => {
    mocks.logout.mockResolvedValueOnce({ success: true, value: { message: 'ok' } });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate();
    });

    await settle(() => !useAuthStore.getState().isAuthenticated);

    expect(mocks.logout).toHaveBeenCalledWith('s1');
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      session: null,
      isAuthenticated: false,
    });

    renderer.unmount();
  });

  it('still signs out locally when the server revocation fails (best effort)', async () => {
    mocks.logout.mockResolvedValueOnce({
      success: false,
      error: { code: 'NETWORK', message: 'offline', statusCode: 0 },
    });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate();
    });

    await settle(() => !useAuthStore.getState().isAuthenticated);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    renderer.unmount();
  });

  it('clears the query cache so the next account sees no stale data', async () => {
    mocks.logout.mockResolvedValueOnce({ success: true, value: { message: 'ok' } });
    await queryClient.prefetchQuery({ queryKey: ['tasks'], queryFn: async () => [] });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate();
    });

    await settle(() => !useAuthStore.getState().isAuthenticated);

    expect(queryClient.getQueryData(['tasks'])).toBeUndefined();

    renderer.unmount();
  });

  it('does not call the backend when there is no session', async () => {
    useAuthStore.setState({ session: null, isAuthenticated: true });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate();
    });

    await settle(() => !useAuthStore.getState().isAuthenticated);

    expect(mocks.logout).not.toHaveBeenCalled();

    renderer.unmount();
  });
});
