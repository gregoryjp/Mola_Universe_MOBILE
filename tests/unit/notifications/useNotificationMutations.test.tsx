import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  markAsRead: vi.fn(),
  updatePreferences: vi.fn(),
  registerDevice: vi.fn(),
  removeDevice: vi.fn(),
  requestExpoPushToken: vi.fn(),
}));

vi.mock('@data/notifications/repositories/NotificationRepositoryImpl', () => ({
  notificationRepository: {
    markAsRead: mocks.markAsRead,
    updatePreferences: mocks.updatePreferences,
    registerDevice: mocks.registerDevice,
    removeDevice: mocks.removeDevice,
  },
}));

vi.mock('@data/notifications/push/expoPushToken', () => ({
  requestExpoPushToken: mocks.requestExpoPushToken,
}));

import type { AppNotification } from '@domain/notifications/entities/Notification';
import {
  useMarkNotificationRead,
  useRegisterPushDevice,
  useRemovePushDevice,
  useUpdateNotificationPreferences,
} from '@presentation/notifications/hooks/useNotificationMutations';

const notification: AppNotification = {
  id: 'n1',
  category: 'SHOPPING',
  title: 'Lista completada',
  body: 'Han terminado la compra',
  data: null,
  readAt: '2026-09-17T10:00:00.000Z',
  createdAt: '2026-09-17T09:00:00.000Z',
};

const preferences = {
  tasksEnabled: true,
  calendarEnabled: true,
  shoppingEnabled: true,
  inventoryEnabled: true,
  expensesEnabled: true,
  accountEnabled: true,
  quietHoursStart: null,
  quietHoursEnd: null,
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
});

describe('notification mutation hooks', () => {
  it('marks a notification as read', async () => {
    mocks.markAsRead.mockResolvedValueOnce({ success: true, value: notification });

    const { captured, renderer } = await render(useMarkNotificationRead);

    await act(async () => {
      captured().mutate('n1');
    });
    await flush();

    expect(mocks.markAsRead).toHaveBeenCalledWith('n1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('surfaces the backend error when marking as read', async () => {
    mocks.markAsRead.mockResolvedValueOnce({
      success: false,
      error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found', statusCode: 404 },
    });

    const { captured, renderer } = await render(useMarkNotificationRead);

    await act(async () => {
      captured().mutate('missing');
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('NOTIFICATION_NOT_FOUND');

    renderer.unmount();
  });

  it('sends only the toggled preference', async () => {
    mocks.updatePreferences.mockResolvedValueOnce({
      success: true,
      value: { ...preferences, shoppingEnabled: false },
    });

    const { captured, renderer } = await render(useUpdateNotificationPreferences);

    await act(async () => {
      captured().mutate({ shoppingEnabled: false });
    });
    await flush();

    expect(mocks.updatePreferences).toHaveBeenCalledWith({ shoppingEnabled: false });
    expect(captured().data?.shoppingEnabled).toBe(false);

    renderer.unmount();
  });

  it('registers the device once the push permission is granted', async () => {
    mocks.requestExpoPushToken.mockResolvedValueOnce({
      granted: true,
      token: 'ExponentPushToken[abc]',
    });
    mocks.registerDevice.mockResolvedValueOnce({ success: true, value: { registered: true } });

    const { captured, renderer } = await render(useRegisterPushDevice);

    await act(async () => {
      captured().mutate();
    });
    await flush();

    expect(mocks.registerDevice).toHaveBeenCalledWith('ExponentPushToken[abc]');
    expect(captured().data).toEqual({ registered: true });

    renderer.unmount();
  });

  it('does not call the backend when the permission is declined', async () => {
    mocks.requestExpoPushToken.mockResolvedValueOnce({ granted: false });

    const { captured, renderer } = await render(useRegisterPushDevice);

    await act(async () => {
      captured().mutate();
    });
    await flush();

    expect(mocks.registerDevice).not.toHaveBeenCalled();
    expect(captured().data).toEqual({ registered: false });

    renderer.unmount();
  });

  it('removes a device by token', async () => {
    mocks.removeDevice.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(useRemovePushDevice);

    await act(async () => {
      captured().mutate('ExponentPushToken[abc]');
    });
    await flush();

    expect(mocks.removeDevice).toHaveBeenCalledWith('ExponentPushToken[abc]');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });
});
