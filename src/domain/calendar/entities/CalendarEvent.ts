// Mirrors the backend calendar contracts (modules/calendar/interface/ICalendar.ts).

export type CalendarErrorCode =
  | 'CALENDAR_EVENT_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'INVALID_INPUT'
  | 'INTERNAL_ERROR';

export type CalendarEventScope = 'PERSONAL' | 'HOUSEHOLD';

export type CalendarEventType =
  | 'GENERAL'
  | 'BIRTHDAY'
  | 'APPOINTMENT'
  | 'PAYMENT'
  | 'SUBSCRIPTION'
  | 'INSURANCE'
  | 'MAINTENANCE'
  | 'PET'
  | 'TRIP'
  | 'CUSTOM';

export interface CalendarEvent {
  id: string;
  createdBy: string;
  scope: CalendarEventScope;
  householdId: string | null;
  title: string;
  description: string | null;
  type: CalendarEventType;
  /** ISO-8601 instant. */
  startAt: string;
  endAt: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create body. The backend derives `scope` and `householdId` from the route
 * (`/users/calendar-events` vs `/households/:id/calendar-events`) and rejects
 * them in the body (`additionalProperties: false`), so they are not sent.
 */
export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  type?: CalendarEventType;
  startAt: string;
  endAt?: string;
  timezone?: string;
}

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string;
  type?: CalendarEventType;
  startAt?: string;
  /** `null` clears the end time (accepted by the update schema). */
  endAt?: string | null;
  timezone?: string;
}
