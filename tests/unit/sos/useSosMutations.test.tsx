import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createContact: vi.fn(),
  deleteContact: vi.fn(),
  activate: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock('@data/sos/repositories/SosRepositoryImpl', () => ({
  sosRepository: {
    createContact: mocks.createContact,
    deleteContact: mocks.deleteContact,
    activate: mocks.activate,
    cancel: mocks.cancel,
  },
}));

import type { ActivatedSosEvent, SosEvent, TrustedContact } from '@domain/sos/entities/Sos';
import {
  useActivateSos,
  useCancelSos,
  useCreateTrustedContact,
  useDeleteTrustedContact,
} from '@presentation/sos/hooks/useSosMutations';

const contact: TrustedContact = {
  id: 'c1',
  name: 'Ana',
  email: 'ana@example.com',
  phone: null,
  isMolaUser: false,
  pushEnabled: false,
  verified: false,
  createdAt: '2026-09-17T09:00:00.000Z',
};

const activated: ActivatedSosEvent = {
  id: 's1',
  status: 'PENDING',
  message: 'Ayuda',
  locationLat: null,
  locationLng: null,
  activatedAt: '2026-09-17T09:00:00.000Z',
  dispatchedAt: null,
  cancelledAt: null,
  cancelWindowMs: 15000,
};

const cancelled: SosEvent = { ...activated, status: 'CANCELLED' };

const render = async <T,>(
  useHook: () => T,
): Promise<{ captured: () => T; renderer: ReactTestRenderer; client: QueryClient }> => {
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
    client,
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

describe('sos mutation hooks', () => {
  it('creates a trusted contact and refreshes the contact list', async () => {
    mocks.createContact.mockResolvedValueOnce({ success: true, value: contact });
    const { captured, renderer, client } = await render(useCreateTrustedContact);
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    await act(async () => {
      captured().mutate({ name: 'Ana', email: 'ana@example.com' });
    });
    await flush();

    expect(mocks.createContact).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com' });
    expect(captured().data?.id).toBe('c1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['sos', 'contacts'] });

    renderer.unmount();
  });

  it('surfaces the backend error when the contact is duplicated', async () => {
    mocks.createContact.mockResolvedValueOnce({
      success: false,
      error: { code: 'CONTACT_ALREADY_EXISTS', message: 'Contact already exists', statusCode: 409 },
    });

    const { captured, renderer } = await render(useCreateTrustedContact);

    await act(async () => {
      captured().mutate({ name: 'Ana', email: 'ana@example.com' });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('CONTACT_ALREADY_EXISTS');

    renderer.unmount();
  });

  it('deletes a trusted contact by id', async () => {
    mocks.deleteContact.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(useDeleteTrustedContact);

    await act(async () => {
      captured().mutate('c1');
    });
    await flush();

    expect(mocks.deleteContact).toHaveBeenCalledWith('c1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('activates the alert and exposes the cancellation window', async () => {
    mocks.activate.mockResolvedValueOnce({ success: true, value: activated });

    const { captured, renderer } = await render(useActivateSos);

    await act(async () => {
      captured().mutate({ message: 'Ayuda' });
    });
    await flush();

    expect(mocks.activate).toHaveBeenCalledWith({ message: 'Ayuda' });
    expect(captured().data?.cancelWindowMs).toBe(15000);

    renderer.unmount();
  });

  it('cancels an active alert', async () => {
    mocks.cancel.mockResolvedValueOnce({ success: true, value: cancelled });

    const { captured, renderer } = await render(useCancelSos);

    await act(async () => {
      captured().mutate('s1');
    });
    await flush();

    expect(mocks.cancel).toHaveBeenCalledWith('s1');
    expect(captured().data?.status).toBe('CANCELLED');

    renderer.unmount();
  });

  it('surfaces the 409 when the cancellation window is over', async () => {
    mocks.cancel.mockResolvedValueOnce({
      success: false,
      error: { code: 'SOS_ALREADY_DISPATCHED', message: 'SOS already dispatched', statusCode: 409 },
    });

    const { captured, renderer } = await render(useCancelSos);

    await act(async () => {
      captured().mutate('s1');
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('SOS_ALREADY_DISPATCHED');

    renderer.unmount();
  });
});
