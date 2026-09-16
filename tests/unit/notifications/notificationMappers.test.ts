import type { NotificationDto } from '@data/notifications/dtos/notificationDtos';
import {
  toAppNotification,
  toNotificationPreferences,
  toUpdatePreferencesRequest,
} from '@data/notifications/mappers/notificationMappers';
import { describe, expect, it } from 'vitest';

const dto: NotificationDto = {
  id: 'n1',
  category: 'EXPENSES',
  title: 'Nuevo gasto',
  body: 'Se ha añadido un gasto compartido',
  data: { expenseId: 'e1' },
  readAt: null,
  createdAt: '2026-09-17T09:00:00.000Z',
};

describe('notificationMappers', () => {
  it('maps a notification dto onto the entity', () => {
    expect(toAppNotification(dto)).toEqual({
      id: 'n1',
      category: 'EXPENSES',
      title: 'Nuevo gasto',
      body: 'Se ha añadido un gasto compartido',
      data: { expenseId: 'e1' },
      readAt: null,
      createdAt: '2026-09-17T09:00:00.000Z',
    });
  });

  it('normalises missing data and readAt to null', () => {
    const sparse: NotificationDto = {
      id: 'n2',
      category: 'SOS',
      title: 'SOS',
      body: 'Activado',
      createdAt: '2026-09-17T09:00:00.000Z',
    };

    const mapped = toAppNotification(sparse);

    expect(mapped.data).toBeNull();
    expect(mapped.readAt).toBeNull();
  });

  it('keeps readAt when the notification was read', () => {
    const mapped = toAppNotification({ ...dto, readAt: '2026-09-17T10:00:00.000Z' });

    expect(mapped.readAt).toBe('2026-09-17T10:00:00.000Z');
  });

  it('maps preferences and defaults quiet hours to null', () => {
    const mapped = toNotificationPreferences({
      tasksEnabled: true,
      calendarEnabled: false,
      shoppingEnabled: true,
      inventoryEnabled: true,
      expensesEnabled: false,
      accountEnabled: true,
    });

    expect(mapped.calendarEnabled).toBe(false);
    expect(mapped.expensesEnabled).toBe(false);
    expect(mapped.quietHoursStart).toBeNull();
    expect(mapped.quietHoursEnd).toBeNull();
  });

  it('keeps quiet hours when present', () => {
    const mapped = toNotificationPreferences({
      tasksEnabled: true,
      calendarEnabled: true,
      shoppingEnabled: true,
      inventoryEnabled: true,
      expensesEnabled: true,
      accountEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    });

    expect(mapped.quietHoursStart).toBe('22:00');
    expect(mapped.quietHoursEnd).toBe('07:00');
  });

  it('serialises only the provided preference keys', () => {
    expect(toUpdatePreferencesRequest({ tasksEnabled: false })).toEqual({ tasksEnabled: false });
  });

  it('serialises an explicit null to switch quiet hours off', () => {
    expect(toUpdatePreferencesRequest({ quietHoursStart: null })).toEqual({ quietHoursStart: null });
  });

  it('sends an empty body when no preference changed', () => {
    expect(toUpdatePreferencesRequest({})).toEqual({});
  });
});
