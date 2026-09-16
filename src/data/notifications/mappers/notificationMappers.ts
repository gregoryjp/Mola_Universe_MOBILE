import type {
  AppNotification,
  NotificationCategory,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@domain/notifications/entities/Notification';
import type {
  NotificationDto,
  NotificationPreferencesDto,
  UpdatePreferencesRequestDto,
} from '../dtos/notificationDtos';

export const toAppNotification = (dto: NotificationDto): AppNotification => ({
  id: dto.id,
  category: dto.category as NotificationCategory,
  title: dto.title,
  body: dto.body,
  data: dto.data ?? null,
  readAt: dto.readAt ?? null,
  createdAt: dto.createdAt,
});

export const toNotificationPreferences = (
  dto: NotificationPreferencesDto,
): NotificationPreferences => ({
  tasksEnabled: dto.tasksEnabled,
  calendarEnabled: dto.calendarEnabled,
  shoppingEnabled: dto.shoppingEnabled,
  inventoryEnabled: dto.inventoryEnabled,
  expensesEnabled: dto.expensesEnabled,
  accountEnabled: dto.accountEnabled,
  quietHoursStart: dto.quietHoursStart ?? null,
  quietHoursEnd: dto.quietHoursEnd ?? null,
});

export const toUpdatePreferencesRequest = (
  input: UpdateNotificationPreferencesInput,
): UpdatePreferencesRequestDto => ({
  ...(input.tasksEnabled !== undefined && { tasksEnabled: input.tasksEnabled }),
  ...(input.calendarEnabled !== undefined && { calendarEnabled: input.calendarEnabled }),
  ...(input.shoppingEnabled !== undefined && { shoppingEnabled: input.shoppingEnabled }),
  ...(input.inventoryEnabled !== undefined && { inventoryEnabled: input.inventoryEnabled }),
  ...(input.expensesEnabled !== undefined && { expensesEnabled: input.expensesEnabled }),
  ...(input.accountEnabled !== undefined && { accountEnabled: input.accountEnabled }),
  ...(input.quietHoursStart !== undefined && { quietHoursStart: input.quietHoursStart }),
  ...(input.quietHoursEnd !== undefined && { quietHoursEnd: input.quietHoursEnd }),
});
