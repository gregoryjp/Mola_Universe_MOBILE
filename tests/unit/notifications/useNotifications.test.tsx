import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ list: vi.fn(), getPreferences: vi.fn() }));

vi.mock('@data/notifications/repositories/NotificationRepositoryImpl', () => ({
  notificationRepository: { list: mocks.list, getPreferences: mocks.getPreferences },
}));

import type { AppNotification } from '@domain/notifications/entities/Notification';
import {
  useNotificationPreferences,
  useNotificationsList,
} from '@presentation/notifications/hooks/useNotifications';

const notification: AppNotification = {
  id: 'n1',
  category: 'TASKS',
  title: 'Tarea asignada',
  body: 'Te han asignado una tarea',
  data: null,
  readAt: null,
  createdAt: '2026-09-17T09:00:00.000Z',
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

describe('useNotificationsList', () => {
  it('loads the notifications of the user', async () => {
    mocks.list.mockResolvedValueOnce({ success: true, value: [notification] });

    const { captured, renderer } = await render(useNotificationsList);
    await flush();

    expect(captured().data).toHaveLength(1);
    expect(captured().data?.[0]?.title).toBe('Tarea asignada');

    renderer.unmount();
  });

  it('exposes the backend error', async () => {
    mocks.list.mockResolvedValueOnce({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list notifications', statusCode: 500 },
    });

    const { captured, renderer } = await render(useNotificationsList);
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('INTERNAL_ERROR');

    renderer.unmount();
  });
});

describe('useNotificationPreferences', () => {
  it('loads the preferences', async () => {
    mocks.getPreferences.mockResolvedValueOnce({
      success: true,
      value: {
        tasksEnabled: true,
        calendarEnabled: false,
        shoppingEnabled: true,
        inventoryEnabled: true,
        expensesEnabled: true,
        accountEnabled: true,
        quietHoursStart: null,
        quietHoursEnd: null,
      },
    });

    const { captured, renderer } = await render(useNotificationPreferences);
    await flush();

    expect(captured().data?.calendarEnabled).toBe(false);

    renderer.unmount();
  });
});
