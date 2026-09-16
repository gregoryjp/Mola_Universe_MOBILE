import type {
  CalendarEvent,
  CalendarEventScope,
  CalendarEventType,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@domain/calendar/entities/CalendarEvent';
import type {
  CalendarEventDto,
  CreateCalendarEventRequestDto,
  UpdateCalendarEventRequestDto,
} from '../dtos/calendarDtos';

export const toCalendarEvent = (dto: CalendarEventDto): CalendarEvent => ({
  id: dto.id,
  createdBy: dto.createdBy,
  scope: dto.scope as CalendarEventScope,
  householdId: dto.householdId ?? null,
  title: dto.title,
  description: dto.description ?? null,
  type: dto.type as CalendarEventType,
  startAt: dto.startAt,
  endAt: dto.endAt ?? null,
  timezone: dto.timezone,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toCreateCalendarEventRequest = (
  input: CreateCalendarEventInput,
): CreateCalendarEventRequestDto => ({
  title: input.title,
  startAt: input.startAt,
  ...(input.description !== undefined && { description: input.description }),
  ...(input.type !== undefined && { type: input.type }),
  ...(input.endAt !== undefined && { endAt: input.endAt }),
  ...(input.timezone !== undefined && { timezone: input.timezone }),
});

export const toUpdateCalendarEventRequest = (
  input: UpdateCalendarEventInput,
): UpdateCalendarEventRequestDto => ({
  ...(input.title !== undefined && { title: input.title }),
  ...(input.description !== undefined && { description: input.description }),
  ...(input.type !== undefined && { type: input.type }),
  ...(input.startAt !== undefined && { startAt: input.startAt }),
  ...(input.endAt !== undefined && { endAt: input.endAt }),
  ...(input.timezone !== undefined && { timezone: input.timezone }),
});
