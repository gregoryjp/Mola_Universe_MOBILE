import { requestExpoPushToken } from '@data/notifications/push/expoPushToken';
import { notificationRepository } from '@data/notifications/repositories/NotificationRepositoryImpl';
import type {
  AppNotification,
  NotificationPreferences,
  RegisterDeviceResult,
  UpdateNotificationPreferencesInput,
} from '@domain/notifications/entities/Notification';
import type { NotificationsResult } from '@domain/notifications/repositories/NotificationRepository';
import { AppError } from '@shared/errors/AppError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pushRegistrationStatusQueryPrefix } from './pushRegistrationKeys';
import { notificationPreferencesQueryKey, notificationsQueryKey } from './useNotifications';

const unwrap = <T>(result: NotificationsResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<AppNotification, AppError, string>({
    mutationFn: async (notificationId) =>
      unwrap(await notificationRepository.markAsRead(notificationId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey() });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreferences, AppError, UpdateNotificationPreferencesInput>({
    mutationFn: async (input) => unwrap(await notificationRepository.updatePreferences(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationPreferencesQueryKey() });
    },
  });
};

/**
 * Asks the OS for the push permission and hands the Expo token to the backend.
 * A declined permission is a normal outcome, not an error: it resolves with
 * `{ registered: false }` so the screen can tell the user what happened.
 */
export const useRegisterPushDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<RegisterDeviceResult, AppError, void>({
    mutationFn: async () => {
      const pushToken = await requestExpoPushToken();
      if (!pushToken.granted) return { registered: false };
      return unwrap(await notificationRepository.registerDevice(pushToken.token));
    },
    onSuccess: () => {
      // Re-resolve the shared status: the user may have just granted the
      // permission, which flips the screen from "activate" to "active".
      void queryClient.invalidateQueries({ queryKey: pushRegistrationStatusQueryPrefix });
    },
  });
};

export const useRemovePushDevice = () =>
  useMutation<void, AppError, string>({
    mutationFn: async (expoToken) => {
      const result = await notificationRepository.removeDevice(expoToken);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
  });
