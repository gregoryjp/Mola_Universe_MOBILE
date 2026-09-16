// Mirrors the backend notifications payloads (modules/notifications/interface/INotification.ts).

export interface NotificationDto {
  id: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferencesDto {
  tasksEnabled: boolean;
  calendarEnabled: boolean;
  shoppingEnabled: boolean;
  inventoryEnabled: boolean;
  expensesEnabled: boolean;
  accountEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

export interface UpdatePreferencesRequestDto {
  tasksEnabled?: boolean;
  calendarEnabled?: boolean;
  shoppingEnabled?: boolean;
  inventoryEnabled?: boolean;
  expensesEnabled?: boolean;
  accountEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

/** `RegisterDeviceSchema`: `{ expoToken }`, additionalProperties false. */
export interface RegisterDeviceRequestDto {
  expoToken: string;
}

/** `POST /notifications/devices` responds `{ registered: true }`. */
export interface RegisterDeviceResponseDto {
  registered: boolean;
}
