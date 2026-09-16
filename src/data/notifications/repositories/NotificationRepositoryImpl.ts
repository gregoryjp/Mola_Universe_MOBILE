import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  AppNotification,
  NotificationPreferences,
  RegisterDeviceResult,
  UpdateNotificationPreferencesInput,
} from '@domain/notifications/entities/Notification';
import type {
  NotificationRepository,
  NotificationsResult,
} from '@domain/notifications/repositories/NotificationRepository';
import type {
  NotificationDto,
  NotificationPreferencesDto,
  RegisterDeviceRequestDto,
  RegisterDeviceResponseDto,
  UpdatePreferencesRequestDto,
} from '../dtos/notificationDtos';
import {
  toAppNotification,
  toNotificationPreferences,
  toUpdatePreferencesRequest,
} from '../mappers/notificationMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): NotificationsResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const emptyOk = (): NotificationsResult<void> => ({ success: true, value: undefined });

export class NotificationRepositoryImpl implements NotificationRepository {
  async list(): Promise<NotificationsResult<AppNotification[]>> {
    const raw = await apiClient.getRaw<NotificationDto[]>('/notifications');
    return raw.success
      ? { success: true, value: raw.data.map(toAppNotification) }
      : { success: false, error: toError(raw) };
  }

  async markAsRead(notificationId: string): Promise<NotificationsResult<AppNotification>> {
    const raw = await apiClient.patchRaw<NotificationDto>(`/notifications/${notificationId}/read`);
    return toResult(raw, toAppNotification);
  }

  async getPreferences(): Promise<NotificationsResult<NotificationPreferences>> {
    const raw = await apiClient.getRaw<NotificationPreferencesDto>('/notifications/preferences');
    return toResult(raw, toNotificationPreferences);
  }

  async updatePreferences(
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationsResult<NotificationPreferences>> {
    const body: UpdatePreferencesRequestDto = toUpdatePreferencesRequest(input);
    const raw = await apiClient.putRaw<NotificationPreferencesDto>(
      '/notifications/preferences',
      body,
    );
    return toResult(raw, toNotificationPreferences);
  }

  async registerDevice(expoToken: string): Promise<NotificationsResult<RegisterDeviceResult>> {
    const body: RegisterDeviceRequestDto = { expoToken };
    const raw = await apiClient.postRaw<RegisterDeviceResponseDto>('/notifications/devices', body);
    return toResult(raw, (dto) => ({ registered: dto.registered }));
  }

  async removeDevice(expoToken: string): Promise<NotificationsResult<void>> {
    const raw = await apiClient.deleteRaw<void>(
      `/notifications/devices/${encodeURIComponent(expoToken)}`,
    );
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }
}

export const notificationRepository: NotificationRepository = new NotificationRepositoryImpl();
