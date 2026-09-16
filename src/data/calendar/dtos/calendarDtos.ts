// Mirrors the backend calendar payloads (modules/calendar/interface/ICalendar.ts).

export interface CalendarEventDto {
  id: string;
  createdBy: string;
  scope: string;
  householdId?: string | null;
  title: string;
  description?: string | null;
  type: string;
  startAt: string;
  endAt?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventRequestDto {
  title: string;
  description?: string;
  type?: string;
  startAt: string;
  endAt?: string;
  timezone?: string;
}

export interface UpdateCalendarEventRequestDto {
  title?: string;
  description?: string;
  type?: string;
  startAt?: string;
  endAt?: string | null;
  timezone?: string;
}
