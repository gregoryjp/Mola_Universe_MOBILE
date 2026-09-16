import type { CalendarEventDto } from '@data/calendar/dtos/calendarDtos';
import {
  toCalendarEvent,
  toCreateCalendarEventRequest,
  toUpdateCalendarEventRequest,
} from '@data/calendar/mappers/calendarMappers';
import { describe, expect, it } from 'vitest';

const eventDto: CalendarEventDto = {
  id: 'ev1',
  createdBy: 'u1',
  scope: 'HOUSEHOLD',
  householdId: 'h1',
  title: 'Cumpleaños',
  description: null,
  type: 'BIRTHDAY',
  startAt: '2026-09-20T18:00:00.000Z',
  endAt: null,
  timezone: 'Europe/Madrid',
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

describe('calendarMappers', () => {
  it('normalises optional event fields to null', () => {
    const event = toCalendarEvent(eventDto);

    expect(event.description).toBeNull();
    expect(event.endAt).toBeNull();
    expect(event.type).toBe('BIRTHDAY');
    expect(event.scope).toBe('HOUSEHOLD');
  });

  it('defaults a missing householdId to null (personal event)', () => {
    const { householdId: _omit, ...rest } = eventDto;
    const event = toCalendarEvent({ ...rest, scope: 'PERSONAL' });

    expect(event.householdId).toBeNull();
    expect(event.scope).toBe('PERSONAL');
  });

  it('builds the create request, omitting undefined optionals', () => {
    const body = toCreateCalendarEventRequest({ title: 'Cita', startAt: '2026-09-20T18:00:00Z' });

    expect(body).toEqual({ title: 'Cita', startAt: '2026-09-20T18:00:00Z' });
    expect('type' in body).toBe(false);
    expect('timezone' in body).toBe(false);
  });

  it('includes type, endAt and timezone when provided', () => {
    const body = toCreateCalendarEventRequest({
      title: 'Viaje',
      startAt: '2026-09-20T18:00:00Z',
      endAt: '2026-09-27T18:00:00Z',
      type: 'TRIP',
      timezone: 'Europe/Madrid',
      description: 'Escapada',
    });

    expect(body).toEqual({
      title: 'Viaje',
      startAt: '2026-09-20T18:00:00Z',
      endAt: '2026-09-27T18:00:00Z',
      type: 'TRIP',
      timezone: 'Europe/Madrid',
      description: 'Escapada',
    });
  });

  it('builds an update request omitting untouched fields', () => {
    const body = toUpdateCalendarEventRequest({ title: 'Nuevo título' });

    expect(body).toEqual({ title: 'Nuevo título' });
  });

  it('forwards an explicit null endAt to clear the end time', () => {
    const body = toUpdateCalendarEventRequest({ endAt: null });

    expect('endAt' in body).toBe(true);
    expect(body.endAt).toBeNull();
  });
});
