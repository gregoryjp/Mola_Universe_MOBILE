import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listHouseholdEvents: vi.fn(),
  listPersonalEvents: vi.fn(),
  getEvent: vi.fn(),
}));

vi.mock('@data/calendar/repositories/CalendarRepositoryImpl', () => ({
  calendarRepository: {
    listHouseholdEvents: mocks.listHouseholdEvents,
    listPersonalEvents: mocks.listPersonalEvents,
    getEvent: mocks.getEvent,
  },
}));

import type { CalendarEvent } from '@domain/calendar/entities/CalendarEvent';
import {
  useCalendarEvent,
  useHouseholdEvents,
  usePersonalEvents,
} from '@presentation/calendar/hooks/useCalendarEvents';
import { useHouseholdStore } from '@shared/store/householdStore';

const event: CalendarEvent = {
  id: 'ev1',
  createdBy: 'u1',
  scope: 'HOUSEHOLD',
  householdId: 'h1',
  title: 'Cumple',
  description: null,
  type: 'BIRTHDAY',
  startAt: '2026-09-20T18:00:00.000Z',
  endAt: null,
  timezone: 'Europe/Madrid',
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const withQueryClient = async (node: React.ReactElement): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('calendar query hooks', () => {
  it('loads household events when a household is active', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listHouseholdEvents.mockResolvedValueOnce({ success: true, value: [event] });

    let captured: ReturnType<typeof useHouseholdEvents> | undefined;
    const Harness = (): null => {
      captured = useHouseholdEvents();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listHouseholdEvents).toHaveBeenCalledWith('h1');
    expect(captured?.data).toHaveLength(1);

    renderer.unmount();
  });

  it('stays idle (no request) when no household is active', async () => {
    let captured: ReturnType<typeof useHouseholdEvents> | undefined;
    const Harness = (): null => {
      captured = useHouseholdEvents();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listHouseholdEvents).not.toHaveBeenCalled();
    expect(captured?.fetchStatus).toBe('idle');

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listHouseholdEvents.mockResolvedValueOnce({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not a member', statusCode: 403 },
    });

    let captured: ReturnType<typeof useHouseholdEvents> | undefined;
    const Harness = (): null => {
      captured = useHouseholdEvents();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('UNAUTHORIZED');

    renderer.unmount();
  });

  it('loads personal events without a household', async () => {
    mocks.listPersonalEvents.mockResolvedValueOnce({ success: true, value: [event] });

    let captured: ReturnType<typeof usePersonalEvents> | undefined;
    const Harness = (): null => {
      captured = usePersonalEvents();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listPersonalEvents).toHaveBeenCalled();
    expect(captured?.data).toHaveLength(1);

    renderer.unmount();
  });

  it('loads a single event', async () => {
    mocks.getEvent.mockResolvedValueOnce({ success: true, value: event });

    let captured: ReturnType<typeof useCalendarEvent> | undefined;
    const Harness = (): null => {
      captured = useCalendarEvent('ev1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.getEvent).toHaveBeenCalledWith('ev1');
    expect(captured?.data?.title).toBe('Cumple');

    renderer.unmount();
  });
});
