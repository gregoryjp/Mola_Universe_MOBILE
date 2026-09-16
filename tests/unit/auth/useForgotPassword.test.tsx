import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ forgotPassword: vi.fn() }));

vi.mock('@data/auth/repositories/AuthRepositoryImpl', () => ({
  authRepository: { forgotPassword: mocks.forgotPassword },
}));

import { useForgotPassword } from '@presentation/auth/hooks/useForgotPassword';

let captured: ReturnType<typeof useForgotPassword> | undefined;

const Harness = (): null => {
  captured = useForgotPassword();
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
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
  }
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
});

describe('useForgotPassword', () => {
  it('calls the repository and returns the verification token', async () => {
    mocks.forgotPassword.mockResolvedValueOnce({
      success: true,
      value: { verificationToken: 'challenge', message: 'Sent' },
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
      captured?.mutate('a@b.com');
    });

    await settle(() => captured?.data !== undefined);

    expect(mocks.forgotPassword).toHaveBeenCalledWith('a@b.com');
    expect(captured?.data?.verificationToken).toBe('challenge');

    renderer?.unmount();
  });
});
