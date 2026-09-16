// Mirrors the backend notifications contracts (modules/notifications/interface/INotification.ts).

export type NotificationCategory =
  | 'TASKS'
  | 'CALENDAR'
  | 'SHOPPING'
  | 'INVENTORY'
  | 'EXPENSES'
  | 'ACCOUNT'
  | 'SECURITY'
  | 'SOS';

/**
 * Named `AppNotification` (not `Notification`) because the DOM/React Native
 * global `Notification` would shadow — or be shadowed by — this entity.
 */
export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * Per-category delivery switches. `SECURITY` and `SOS` notifications are
 * always delivered, so they have no switch here (backend: same rule).
 */
export interface NotificationPreferences {
  tasksEnabled: boolean;
  calendarEnabled: boolean;
  shoppingEnabled: boolean;
  inventoryEnabled: boolean;
  expensesEnabled: boolean;
  accountEnabled: boolean;
  /** "HH:MM" or null when quiet hours are off. */
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export interface UpdateNotificationPreferencesInput {
  tasksEnabled?: boolean;
  calendarEnabled?: boolean;
  shoppingEnabled?: boolean;
  inventoryEnabled?: boolean;
  expensesEnabled?: boolean;
  accountEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

export interface RegisterDeviceResult {
  registered: boolean;
}
