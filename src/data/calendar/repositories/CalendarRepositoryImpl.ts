import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@domain/calendar/entities/CalendarEvent';
import type {
  CalendarRepository,
  CalendarResult,
} from '@domain/calendar/repositories/CalendarRepository';
import type {
  CalendarEventDto,
  CreateCalendarEventRequestDto,
  UpdateCalendarEventRequestDto,
} from '../dtos/calendarDtos';
import {
  toCalendarEvent,
  toCreateCalendarEventRequest,
  toUpdateCalendarEventRequest,
} from '../mappers/calendarMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): CalendarResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const toList = (raw: RawResult<CalendarEventDto[]>): CalendarResult<CalendarEvent[]> =>
  raw.success
    ? { success: true, value: raw.data.map(toCalendarEvent) }
    : { success: false, error: toError(raw) };

const emptyOk = (): CalendarResult<void> => ({ success: true, value: undefined });

export class CalendarRepositoryImpl implements CalendarRepository {
  async listPersonalEvents(): Promise<CalendarResult<CalendarEvent[]>> {
    return toList(await apiClient.getRaw<CalendarEventDto[]>('/users/calendar-events'));
  }

  async createPersonalEvent(
    input: CreateCalendarEventInput,
  ): Promise<CalendarResult<CalendarEvent>> {
    const body: CreateCalendarEventRequestDto = toCreateCalendarEventRequest(input);
    const raw = await apiClient.postRaw<CalendarEventDto>('/users/calendar-events', body);
    return toResult(raw, toCalendarEvent);
  }

  async listHouseholdEvents(householdId: string): Promise<CalendarResult<CalendarEvent[]>> {
    return toList(
      await apiClient.getRaw<CalendarEventDto[]>(`/households/${householdId}/calendar-events`),
    );
  }

  async createHouseholdEvent(
    householdId: string,
    input: CreateCalendarEventInput,
  ): Promise<CalendarResult<CalendarEvent>> {
    const body: CreateCalendarEventRequestDto = toCreateCalendarEventRequest(input);
    const raw = await apiClient.postRaw<CalendarEventDto>(
      `/households/${householdId}/calendar-events`,
      body,
    );
    return toResult(raw, toCalendarEvent);
  }

  async getEvent(eventId: string): Promise<CalendarResult<CalendarEvent>> {
    const raw = await apiClient.getRaw<CalendarEventDto>(`/users/calendar-events/${eventId}`);
    return toResult(raw, toCalendarEvent);
  }

  async updateEvent(
    eventId: string,
    input: UpdateCalendarEventInput,
  ): Promise<CalendarResult<CalendarEvent>> {
    const body: UpdateCalendarEventRequestDto = toUpdateCalendarEventRequest(input);
    const raw = await apiClient.patchRaw<CalendarEventDto>(
      `/users/calendar-events/${eventId}`,
      body,
    );
    return toResult(raw, toCalendarEvent);
  }

  async deleteEvent(eventId: string): Promise<CalendarResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/users/calendar-events/${eventId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }
}

export const calendarRepository: CalendarRepository = new CalendarRepositoryImpl();
