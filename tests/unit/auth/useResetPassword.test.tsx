import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({ resetPassword: vi.fn() }));

vi.mock('@data/auth/repositories/AuthRepositoryImpl', () => ({
  authRepository: { resetPassword: mocks.resetPassword },
}));

import { useResetPassword } from '@presentation/auth/hooks/useResetPassword';

let captured: ReturnType<typeof useResetPassword> | undefined;

const Harness = (): null => {
  captured = useResetPassword();
  return null;
};

/**
 * Polls until `predicate` holds, flushing timers between attempts. The mutation
 * result only reaches `captured` after React commits the updated state, so
 * asserting right after a single `act` is a race.
 */
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
});

describe('useResetPassword', () => {
  it('calls the repository with the verification token, code and new password', async () => {
    mocks.resetPassword.mockResolvedValueOnce({
      success: true,
      value: { message: 'Contraseña actualizada' },
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
        verificationToken: 'challenge',
        code: '123456',
        newPassword: 'password1',
      });
    });

    await settle(() => captured?.data !== undefined);

    expect(mocks.resetPassword).toHaveBeenCalledWith({
      verificationToken: 'challenge',
      code: '123456',
      newPassword: 'password1',
    });
    expect(captured?.data?.message).toBe('Contraseña actualizada');

    renderer?.unmount();
  });

  it('surfaces the domain error when the code is invalid or expired', async () => {
    mocks.resetPassword.mockResolvedValueOnce({
      success: false,
      error: { code: 'INVALID_CODE', message: 'Código inválido o expirado', statusCode: 400 },
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
        verificationToken: 'challenge',
        code: '000000',
        newPassword: 'password1',
      });
    });

    await settle(() => captured?.isError === true);

    expect(captured?.error?.message).toBe('Código inválido o expirado');

    renderer?.unmount();
  });
});
