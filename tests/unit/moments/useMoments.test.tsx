import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  listMoments: vi.fn(),
  getMoment: vi.fn(),
  listExternalInvites: vi.fn(),
}));

vi.mock('@data/moments/repositories/MomentRepositoryImpl', () => ({
  momentRepository: {
    listMoments: mocks.listMoments,
    getMoment: mocks.getMoment,
    listExternalInvites: mocks.listExternalInvites,
  },
}));

import type { Moment, MomentDetail, MomentExternalInvite } from '@domain/moments/entities/Moment';
import {
  useMoment,
  useMomentExternalInvites,
  useMoments,
} from '@presentation/moments/hooks/useMoments';
import { useHouseholdStore } from '@shared/store/householdStore';

const moment: Moment = {
  id: 'm1',
  householdId: 'h1',
  createdBy: 'u1',
  type: 'EVENT',
  title: 'Cena en casa',
  description: null,
  eventDate: '2026-09-20T18:00:00.000Z',
  detail: null,
  status: 'OPEN',
  calendarEventId: null,
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
};

const detail: MomentDetail = {
  ...moment,
  participants: [{ id: 'p1', momentId: 'm1', userId: 'u1', response: 'GOING', respondedAt: null }],
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
  await act(async () => {
    await flushQueries();
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('moments query hooks', () => {
  it('loads the moments of the active household', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listMoments.mockResolvedValueOnce({ success: true, value: [moment] });

    let captured: ReturnType<typeof useMoments> | undefined;
    const Harness = (): null => {
      captured = useMoments();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listMoments).toHaveBeenCalledWith('h1');
    expect(captured?.data).toHaveLength(1);

    renderer.unmount();
  });

  it('does not query without an active household', async () => {
    let captured: ReturnType<typeof useMoments> | undefined;
    const Harness = (): null => {
      captured = useMoments();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listMoments).not.toHaveBeenCalled();
    expect(captured?.data).toBeUndefined();

    renderer.unmount();
  });

  it('surfaces the backend error when the list fails', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listMoments.mockResolvedValueOnce({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authorized', statusCode: 403 },
    });

    let captured: ReturnType<typeof useMoments> | undefined;
    const Harness = (): null => {
      captured = useMoments();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('UNAUTHORIZED');

    renderer.unmount();
  });

  it('loads a moment with its participants', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.getMoment.mockResolvedValueOnce({ success: true, value: detail });

    let captured: ReturnType<typeof useMoment> | undefined;
    const Harness = (): null => {
      captured = useMoment('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.getMoment).toHaveBeenCalledWith('h1', 'm1');
    expect(captured?.data?.participants).toHaveLength(1);

    renderer.unmount();
  });

  it('does not load a moment without an id', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });

    const Harness = (): null => {
      useMoment('');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.getMoment).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('loads the external invites of a moment', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listExternalInvites.mockResolvedValueOnce({ success: true, value: [invite] });

    let captured: ReturnType<typeof useMomentExternalInvites> | undefined;
    const Harness = (): null => {
      captured = useMomentExternalInvites('m1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listExternalInvites).toHaveBeenCalledWith('h1', 'm1');
    expect(captured?.data?.[0]?.email).toBe('ana@ejemplo.com');

    renderer.unmount();
  });
});
