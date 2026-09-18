import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
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
  authRepository: { updateProfile: mocks.updateProfile },
}));

import { useUpdateProfile } from '@presentation/auth/hooks/useUpdateProfile';
import { useAuthStore } from '@shared/store/authStore';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

let captured: ReturnType<typeof useUpdateProfile> | undefined;

const Harness = (): null => {
  captured = useUpdateProfile();
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
  useAuthStore.setState({
    user,
    session: null,
    isAuthenticated: true,
    isHydrated: true,
    verificationToken: null,
  });
});

describe('useUpdateProfile', () => {
  it('PATCHes the profile and updates the stored user name on success', async () => {
    mocks.updateProfile.mockResolvedValueOnce({
      success: true,
      value: { ...user, name: 'Ada Lovelace' },
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
      captured?.mutate({ displayName: 'Ada Lovelace' });
    });

    await settle(() => useAuthStore.getState().user?.name === 'Ada Lovelace');

    expect(mocks.updateProfile).toHaveBeenCalledWith({ displayName: 'Ada Lovelace' });
    expect(useAuthStore.getState().user?.name).toBe('Ada Lovelace');

    renderer?.unmount();
  });

  it('surfaces the domain error without touching the stored user', async () => {
    mocks.updateProfile.mockResolvedValueOnce({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Nombre inválido', statusCode: 400 },
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
      captured?.mutate({ displayName: '' });
    });

    await settle(() => captured?.isError === true);

    expect(captured?.error?.message).toBe('Nombre inválido');
    expect(useAuthStore.getState().user?.name).toBe('Ada');

    renderer?.unmount();
  });
});
