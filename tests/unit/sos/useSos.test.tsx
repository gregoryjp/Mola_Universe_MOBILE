import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ listContacts: vi.fn(), history: vi.fn() }));

vi.mock('@data/sos/repositories/SosRepositoryImpl', () => ({
  sosRepository: { listContacts: mocks.listContacts, history: mocks.history },
}));

import type { SosEvent, TrustedContact } from '@domain/sos/entities/Sos';
import { useSosHistory, useTrustedContacts } from '@presentation/sos/hooks/useSos';

const contact: TrustedContact = {
  id: 'c1',
  name: 'Ana',
  email: 'ana@example.com',
  phone: null,
  isMolaUser: true,
  pushEnabled: true,
  verified: true,
  createdAt: '2026-09-17T09:00:00.000Z',
};

const event: SosEvent = {
  id: 's1',
  status: 'SENT',
  message: 'Ayuda',
  locationLat: null,
  locationLng: null,
  activatedAt: '2026-09-17T09:00:00.000Z',
  dispatchedAt: '2026-09-17T09:00:15.000Z',
  cancelledAt: null,
};

const render = async <T,>(
  useHook: () => T,
): Promise<{ captured: () => T; renderer: ReactTestRenderer }> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let value: T | undefined;
  const Harness = (): null => {
    value = useHook();
    return null;
  };
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  const capturedRenderer = renderer;
  return {
    captured: () => {
      if (value === undefined) throw new Error('hook not captured');
      return value;
    },
    renderer: capturedRenderer,
  };
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTrustedContacts', () => {
  it('loads the trusted contacts', async () => {
    mocks.listContacts.mockResolvedValueOnce({ success: true, value: [contact] });

    const { captured, renderer } = await render(useTrustedContacts);
    await flush();

    expect(captured().data).toHaveLength(1);
    expect(captured().data?.[0]?.verified).toBe(true);

    renderer.unmount();
  });

  it('exposes the backend error as an AppError', async () => {
    mocks.listContacts.mockResolvedValueOnce({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list contacts', statusCode: 500 },
    });

    const { captured, renderer } = await render(useTrustedContacts);
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('INTERNAL_ERROR');

    renderer.unmount();
  });
});

describe('useSosHistory', () => {
  it('loads the activation history', async () => {
    mocks.history.mockResolvedValueOnce({ success: true, value: [event] });

    const { captured, renderer } = await render(useSosHistory);
    await flush();

    expect(captured().data?.[0]?.status).toBe('SENT');

    renderer.unmount();
  });
});
