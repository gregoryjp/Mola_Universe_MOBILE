import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  resendVerification: vi.fn(),
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
  authRepository: { resendVerification: mocks.resendVerification },
}));

import { useResendVerification } from '@presentation/auth/hooks/useResendVerification';
import { useAuthStore } from '@shared/store/authStore';

let captured: ReturnType<typeof useResendVerification> | undefined;

const Harness = (): null => {
  captured = useResendVerification();
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
    verificationToken: 'old-challenge',
    verificationExpiresAt: '2026-09-18T10:00:00.000Z',
  });
});

describe('useResendVerification', () => {
  it('replaces the challenge and expiry after a successful resend', async () => {
    mocks.resendVerification.mockResolvedValueOnce({
      success: true,
      value: {
        verificationToken: 'fresh-challenge',
        otpExpiresAt: '2026-09-18T10:01:00.000Z',
        otpExpiresIn: 60,
        message: 'Sent',
      },
    });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate('a@b.com');
    });
    await settle(() => captured?.isSuccess === true);

    expect(mocks.resendVerification).toHaveBeenCalledWith('a@b.com');
    expect(useAuthStore.getState()).toMatchObject({
      verificationToken: 'fresh-challenge',
      verificationExpiresAt: '2026-09-18T10:01:00.000Z',
    });

    renderer.unmount();
  });

  it('rejects a non-actionable non-leaking response instead of reporting a fake resend', async () => {
    mocks.resendVerification.mockResolvedValueOnce({
      success: true,
      value: { verificationToken: '', message: 'Sent' },
    });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate('a@b.com');
    });
    await settle(() => captured?.isError === true);

    expect(captured?.error).toMatchObject({ code: 'AUTH_VERIFICATION_UNAVAILABLE' });
    expect(useAuthStore.getState().verificationToken).toBe('old-challenge');

    renderer.unmount();
  });

  it('surfaces backend and network errors unchanged', async () => {
    mocks.resendVerification.mockResolvedValueOnce({
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'offline', statusCode: 0 },
    });
    const renderer = await renderHarness();

    await act(async () => {
      captured?.mutate('a@b.com');
    });
    await settle(() => captured?.isError === true);

    expect(captured?.error).toEqual({
      code: 'NETWORK_ERROR',
      message: 'offline',
      statusCode: 0,
    });

    renderer.unmount();
  });
});
