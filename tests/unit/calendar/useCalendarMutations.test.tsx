import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  createHouseholdEvent: vi.fn(),
  createPersonalEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

vi.mock('@data/calendar/repositories/CalendarRepositoryImpl', () => ({
  calendarRepository: {
    createHouseholdEvent: mocks.createHouseholdEvent,
    createPersonalEvent: mocks.createPersonalEvent,
    updateEvent: mocks.updateEvent,
    deleteEvent: mocks.deleteEvent,
  },
}));

import type { CalendarEvent } from '@domain/calendar/entities/CalendarEvent';
import {
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useUpdateCalendarEvent,
} from '@presentation/calendar/hooks/useCalendarMutations';
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
    await flushQueries();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('calendar mutation hooks', () => {
  it('creates a household event under the active household', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.createHouseholdEvent.mockResolvedValueOnce({ success: true, value: event });

    const { captured, renderer } = await render(useCreateCalendarEvent);

    await act(async () => {
      captured().mutate({
        scope: 'HOUSEHOLD',
        input: { title: 'Cumple', startAt: '2026-09-20T18:00:00Z' },
      });
    });
    await flush();

    expect(mocks.createHouseholdEvent).toHaveBeenCalledWith('h1', {
      title: 'Cumple',
      startAt: '2026-09-20T18:00:00Z',
    });
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('creates a personal event without touching the household', async () => {
    mocks.createPersonalEvent.mockResolvedValueOnce({ success: true, value: event });

    const { captured, renderer } = await render(useCreateCalendarEvent);

    await act(async () => {
      captured().mutate({
        scope: 'PERSONAL',
        input: { title: 'Cita', startAt: '2026-09-20T18:00:00Z' },
      });
    });
    await flush();

    expect(mocks.createPersonalEvent).toHaveBeenCalled();
    expect(mocks.createHouseholdEvent).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('refuses a household event when no household is active', async () => {
    const { captured, renderer } = await render(useCreateCalendarEvent);

    await act(async () => {
      captured().mutate({
        scope: 'HOUSEHOLD',
        input: { title: 'X', startAt: '2026-09-20T18:00:00Z' },
      });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('NO_HOUSEHOLD');

    renderer.unmount();
  });

  it('surfaces the backend error on create', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.createHouseholdEvent.mockResolvedValueOnce({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Invalid date', statusCode: 400 },
    });

    const { captured, renderer } = await render(useCreateCalendarEvent);

    await act(async () => {
      captured().mutate({
        scope: 'HOUSEHOLD',
        input: { title: 'X', startAt: 'nope' },
      });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('INVALID_INPUT');

    renderer.unmount();
  });

  it('updates an event', async () => {
    mocks.updateEvent.mockResolvedValueOnce({ success: true, value: event });

    const { captured, renderer } = await render(() => useUpdateCalendarEvent('ev1'));

    await act(async () => {
      captured().mutate({ title: 'Cambiado' });
    });
    await flush();

    expect(mocks.updateEvent).toHaveBeenCalledWith('ev1', { title: 'Cambiado' });
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('deletes an event', async () => {
    mocks.deleteEvent.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(useDeleteCalendarEvent);

    await act(async () => {
      captured().mutate('ev1');
    });
    await flush();

    expect(mocks.deleteEvent).toHaveBeenCalledWith('ev1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });
});
