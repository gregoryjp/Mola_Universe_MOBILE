import type {
  AppNotification,
  NotificationPreferences,
  RegisterDeviceResult,
  UpdateNotificationPreferencesInput,
} from '../entities/Notification';

export interface NotificationsError {
  code: string;
  message: string;
  statusCode: number;
}

export type NotificationsResult<T> =
  | { success: true; value: T }
  | { success: false; error: NotificationsError };

/**
 * Notifications port. Every route is user-scoped (no household prefix) and the
 * device routes are keyed by the Expo push token, not an opaque id.
 * Verified in modules/notifications/routes/notificationRoutes.ts.
 */
export interface NotificationRepository {
  list(): Promise<NotificationsResult<AppNotification[]>>;
  markAsRead(notificationId: string): Promise<NotificationsResult<AppNotification>>;
  getPreferences(): Promise<NotificationsResult<NotificationPreferences>>;
  updatePreferences(
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationsResult<NotificationPreferences>>;
  registerDevice(expoToken: string): Promise<NotificationsResult<RegisterDeviceResult>>;
  removeDevice(expoToken: string): Promise<NotificationsResult<void>>;
}
