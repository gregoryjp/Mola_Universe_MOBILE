import { notificationRepository } from '@data/notifications/repositories/NotificationRepositoryImpl';
import type {
  AppNotification,
  NotificationPreferences,
} from '@domain/notifications/entities/Notification';
import type { NotificationsError } from '@domain/notifications/repositories/NotificationRepository';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const notificationsQueryKey = () => ['notifications'] as const;
export const notificationPreferencesQueryKey = () => ['notifications', 'preferences'] as const;

function fail(error: NotificationsError): never {
  throw new AppError(error.code, error.message, error.statusCode);
}

export const useNotificationsList = () =>
  useQuery<AppNotification[], AppError>({
    queryKey: notificationsQueryKey(),
    queryFn: async () => {
      const result = await notificationRepository.list();
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

export const useNotificationPreferences = () =>
  useQuery<NotificationPreferences, AppError>({
    queryKey: notificationPreferencesQueryKey(),
    queryFn: async () => {
      const result = await notificationRepository.getPreferences();
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
