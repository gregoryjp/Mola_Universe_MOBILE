import { NotificationRepositoryImpl } from '@data/notifications/repositories/NotificationRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const notificationDto = {
  id: 'n1',
  category: 'EXPENSES',
  title: 'Nuevo gasto',
  body: 'Se ha añadido un gasto compartido',
  data: null,
  readAt: null,
  createdAt: '2026-09-17T09:00:00.000Z',
};

const preferencesDto = {
  tasksEnabled: true,
  calendarEnabled: true,
  shoppingEnabled: true,
  inventoryEnabled: true,
  expensesEnabled: false,
  accountEnabled: true,
  quietHoursStart: null,
  quietHoursEnd: null,
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new NotificationRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NotificationRepositoryImpl', () => {
  it('lists the notifications of the user (flat array)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([notificationDto]));

    const result = await repo.list();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/notifications`, expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual({
      success: true,
      value: [
        {
          id: 'n1',
          category: 'EXPENSES',
          title: 'Nuevo gasto',
          body: 'Se ha añadido un gasto compartido',
          data: null,
          readAt: null,
          createdAt: '2026-09-17T09:00:00.000Z',
        },
      ],
    });
  });

  it('marks a notification as read via PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...notificationDto, readAt: '2026-09-17T10:00:00.000Z' }),
    );

    const result = await repo.markAsRead('n1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/notifications/n1/read`,
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.readAt).toBe('2026-09-17T10:00:00.000Z');
  });

  it('gets the preferences', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(preferencesDto));

    const result = await repo.getPreferences();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/notifications/preferences`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.expensesEnabled).toBe(false);
  });

  it('updates the preferences with PUT and only the changed key', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...preferencesDto, expensesEnabled: true }));

    const result = await repo.updatePreferences({ expensesEnabled: true });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/notifications/preferences`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ expensesEnabled: true }) }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.expensesEnabled).toBe(true);
  });

  it('registers a push device with the expo token', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ registered: true }, 201));

    const result = await repo.registerDevice('ExponentPushToken[abc]');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/notifications/devices`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ expoToken: 'ExponentPushToken[abc]' }),
      }),
    );
    expect(result).toEqual({ success: true, value: { registered: true } });
  });

  it('removes a device by url-encoded token (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.removeDevice('ExponentPushToken[abc]');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/notifications/devices/ExponentPushToken%5Babc%5D`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('maps the backend error envelope (INVALID_PUSH_TOKEN)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'INVALID_PUSH_TOKEN', message: 'Invalid Expo push token format', statusCode: 400 },
        },
        400,
      ),
    );

    const result = await repo.registerDevice('nope');

    expect(result).toEqual({
      success: false,
      error: { code: 'INVALID_PUSH_TOKEN', message: 'Invalid Expo push token format', statusCode: 400 },
    });
  });

  it('maps a 404 on device removal (DEVICE_NOT_FOUND)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'DEVICE_NOT_FOUND', message: 'Push device not found', statusCode: 404 } },
        404,
      ),
    );

    const result = await repo.removeDevice('ExponentPushToken[abc]');

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('DEVICE_NOT_FOUND');
  });
});
