import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '../entities/CalendarEvent';

export interface CalendarError {
  code: string;
  message: string;
  statusCode: number;
}

export type CalendarResult<T> =
  | { success: true; value: T }
  | { success: false; error: CalendarError };

/**
 * Calendar port. Personal events live under `/users/calendar-events`; household
 * events under `/households/:householdId/calendar-events`. Reads and writes are
 * by event id once created (access is checked from the event).
 * Verified in modules/calendar/routes/calendarRoutes.ts.
 */
export interface CalendarRepository {
  listPersonalEvents(): Promise<CalendarResult<CalendarEvent[]>>;
  createPersonalEvent(input: CreateCalendarEventInput): Promise<CalendarResult<CalendarEvent>>;
  listHouseholdEvents(householdId: string): Promise<CalendarResult<CalendarEvent[]>>;
  createHouseholdEvent(
    householdId: string,
    input: CreateCalendarEventInput,
  ): Promise<CalendarResult<CalendarEvent>>;
  getEvent(eventId: string): Promise<CalendarResult<CalendarEvent>>;
  updateEvent(
    eventId: string,
    input: UpdateCalendarEventInput,
  ): Promise<CalendarResult<CalendarEvent>>;
  deleteEvent(eventId: string): Promise<CalendarResult<void>>;
}
