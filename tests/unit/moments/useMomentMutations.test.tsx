import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  createMoment: vi.fn(),
  updateMoment: vi.fn(),
  deleteMoment: vi.fn(),
  respondToMoment: vi.fn(),
  createExternalInvite: vi.fn(),
}));

vi.mock('@data/moments/repositories/MomentRepositoryImpl', () => ({
  momentRepository: {
    createMoment: mocks.createMoment,
    updateMoment: mocks.updateMoment,
    deleteMoment: mocks.deleteMoment,
    respondToMoment: mocks.respondToMoment,
    createExternalInvite: mocks.createExternalInvite,
  },
}));

import type {
  Moment,
  MomentExternalInvite,
  MomentParticipant,
} from '@domain/moments/entities/Moment';
import {
  useCreateMoment,
  useCreateMomentExternalInvite,
  useDeleteMoment,
  useRespondToMoment,
  useUpdateMoment,
} from '@presentation/moments/hooks/useMomentMutations';
import { useHouseholdStore } from '@shared/store/householdStore';

const moment: Moment = {
  id: 'm1',
  householdId: 'h1',
  createdBy: 'u1',
  type: 'EVENT',
  title: 'Cena en casa',
  description: null,
  eventDate: null,
  detail: null,
  status: 'OPEN',
  calendarEventId: null,
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
};

const participant: MomentParticipant = {
  id: 'p1',
  momentId: 'm1',
  userId: 'u1',
  response: 'GOING',
  respondedAt: '2026-09-17T10:00:00.000Z',
};

const invite: MomentExternalInvite = {
  id: 'i1',
  momentId: 'm1',
  email: 'ana@ejemplo.com',
  name: null,
  isMolaUser: false,
  status: 'INVITED',
  invitedAt: '2026-09-17T09:00:00.000Z',
  respondedAt: null,
};

const withQueryClient = async (node: React.ReactElement): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const settle = async (): Promise<void> => {
  await act(async () => {
    await flushQueries();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: 'h1' });
});

describe('moment mutation hooks', () => {
  it('creates a moment in the active household', async () => {
    mocks.createMoment.mockResolvedValueOnce({ success: true, value: moment });

    let captured: ReturnType<typeof useCreateMoment> | undefined;
    const Harness = (): null => {
      captured = useCreateMoment();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate({ type: 'EVENT', title: 'Cena en casa' });
    });
    await settle();

    expect(mocks.createMoment).toHaveBeenCalledWith('h1', {
      type: 'EVENT',
      title: 'Cena en casa',
    });
    expect(captured?.isSuccess).toBe(true);

    renderer.unmount();
  });

  it('rejects the create when there is no active household', async () => {
    useHouseholdStore.setState({ activeHouseholdId: null });

    let captured: ReturnType<typeof useCreateMoment> | undefined;
    const Harness = (): null => {
      captured = useCreateMoment();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate({ type: 'EVENT', title: 'Cena' });
    });
    await settle();

    expect(mocks.createMoment).not.toHaveBeenCalled();
    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('NO_HOUSEHOLD');

    renderer.unmount();
  });

  it('updates a moment', async () => {
    mocks.updateMoment.mockResolvedValueOnce({
      success: true,
      value: { ...moment, title: 'Cena con postre' },
    });

    let captured: ReturnType<typeof useUpdateMoment> | undefined;
    const Harness = (): null => {
      captured = useUpdateMoment('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate({ title: 'Cena con postre' });
    });
    await settle();

    expect(mocks.updateMoment).toHaveBeenCalledWith('h1', 'm1', { title: 'Cena con postre' });

    renderer.unmount();
  });

  it('cancels a moment through the status field', async () => {
    mocks.updateMoment.mockResolvedValueOnce({
      success: true,
      value: { ...moment, status: 'CANCELLED' },
    });

    let captured: ReturnType<typeof useUpdateMoment> | undefined;
    const Harness = (): null => {
      captured = useUpdateMoment('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate({ status: 'CANCELLED' });
    });
    await settle();

    expect(mocks.updateMoment).toHaveBeenCalledWith('h1', 'm1', { status: 'CANCELLED' });
    expect(captured?.data?.status).toBe('CANCELLED');

    renderer.unmount();
  });

  it('deletes a moment', async () => {
    mocks.deleteMoment.mockResolvedValueOnce({ success: true, value: undefined });

    let captured: ReturnType<typeof useDeleteMoment> | undefined;
    const Harness = (): null => {
      captured = useDeleteMoment();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate('m1');
    });
    await settle();

    expect(mocks.deleteMoment).toHaveBeenCalledWith('h1', 'm1');
    expect(captured?.isSuccess).toBe(true);

    renderer.unmount();
  });

  it('surfaces the creator-only 403 when deleting', async () => {
    mocks.deleteMoment.mockResolvedValueOnce({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authorized', statusCode: 403 },
    });

    let captured: ReturnType<typeof useDeleteMoment> | undefined;
    const Harness = (): null => {
      captured = useDeleteMoment();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate('m1');
    });
    await settle();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.statusCode).toBe(403);

    renderer.unmount();
  });

  it('sends the two RSVP answers the backend accepts', async () => {
    mocks.respondToMoment.mockResolvedValue({ success: true, value: participant });

    let captured: ReturnType<typeof useRespondToMoment> | undefined;
    const Harness = (): null => {
      captured = useRespondToMoment('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate('GOING');
    });
    await settle();
    expect(mocks.respondToMoment).toHaveBeenLastCalledWith('h1', 'm1', 'GOING');

    await act(async () => {
      captured?.mutate('NOT_GOING');
    });
    await settle();
    expect(mocks.respondToMoment).toHaveBeenLastCalledWith('h1', 'm1', 'NOT_GOING');
    expect(captured?.isSuccess).toBe(true);

    renderer.unmount();
  });

  it('reports the RSVP error when the backend rejects it', async () => {
    mocks.respondToMoment.mockResolvedValueOnce({
      success: false,
      error: { code: 'MOMENT_NOT_FOUND', message: 'Moment not found', statusCode: 404 },
    });

    let captured: ReturnType<typeof useRespondToMoment> | undefined;
    const Harness = (): null => {
      captured = useRespondToMoment('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate('GOING');
    });
    await settle();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.statusCode).toBe(404);

    renderer.unmount();
  });

  it('creates an external invite', async () => {
    mocks.createExternalInvite.mockResolvedValueOnce({ success: true, value: invite });

    let captured: ReturnType<typeof useCreateMomentExternalInvite> | undefined;
    const Harness = (): null => {
      captured = useCreateMomentExternalInvite('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    await act(async () => {
      captured?.mutate({ email: 'ana@ejemplo.com' });
    });
    await settle();

    expect(mocks.createExternalInvite).toHaveBeenCalledWith('h1', 'm1', {
      email: 'ana@ejemplo.com',
    });
    expect(captured?.data?.id).toBe('i1');

    renderer.unmount();
  });
});
