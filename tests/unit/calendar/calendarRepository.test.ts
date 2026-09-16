import { CalendarRepositoryImpl } from '@data/calendar/repositories/CalendarRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const eventDto = {
  id: 'ev1',
  createdBy: 'u1',
  scope: 'PERSONAL',
  householdId: null,
  title: 'Cita médica',
  description: null,
  type: 'APPOINTMENT',
  startAt: '2026-09-20T18:00:00.000Z',
  endAt: null,
  timezone: 'Europe/Madrid',
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new CalendarRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CalendarRepositoryImpl', () => {
  it('lists personal events (plain array, no pagination)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([eventDto]));

    const result = await repo.listPersonalEvents();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/calendar-events`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toHaveLength(1);
  });

  it('creates a personal event with the serialised body', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(eventDto, 201));

    await repo.createPersonalEvent({ title: 'Cita médica', startAt: '2026-09-20T18:00:00Z' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/calendar-events`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Cita médica', startAt: '2026-09-20T18:00:00Z' }),
      }),
    );
  });

  it('does not leak householdId/scope into the create body', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(eventDto, 201));

    await repo.createPersonalEvent({
      title: 'Cita',
      startAt: '2026-09-20T18:00:00Z',
      type: 'APPOINTMENT',
    });

    const body = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as { body: string }).body,
    ) as Record<string, unknown>;
    expect('householdId' in body).toBe(false);
    expect('scope' in body).toBe(false);
  });

  it('lists household events under the household scope', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([{ ...eventDto, scope: 'HOUSEHOLD' }]));

    await repo.listHouseholdEvents('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/calendar-events`,
      expect.anything(),
    );
  });

  it('creates a household event under the household scope', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...eventDto, scope: 'HOUSEHOLD' }, 201));

    await repo.createHouseholdEvent('h1', {
      title: 'Cumple',
      startAt: '2026-09-20T18:00:00Z',
      type: 'BIRTHDAY',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/calendar-events`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'Cumple',
          startAt: '2026-09-20T18:00:00Z',
          type: 'BIRTHDAY',
        }),
      }),
    );
  });

  it('gets a single event', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(eventDto));

    await repo.getEvent('ev1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/calendar-events/ev1`,
      expect.anything(),
    );
  });

  it('updates an event via PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(eventDto));

    await repo.updateEvent('ev1', { title: 'Cambiado' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/calendar-events/ev1`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: 'Cambiado' }),
      }),
    );
  });

  it('clears endAt by sending null', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(eventDto));

    await repo.updateEvent('ev1', { endAt: null });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/calendar-events/ev1`,
      expect.objectContaining({ body: JSON.stringify({ endAt: null }) }),
    );
  });

  it('deletes an event (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.deleteEvent('ev1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/calendar-events/ev1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('maps the backend error envelope (NOT_FOUND)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'CALENDAR_EVENT_NOT_FOUND',
            message: 'Calendar event not found',
            statusCode: 404,
          },
        },
        404,
      ),
    );

    const result = await repo.getEvent('missing');

    expect(result).toEqual({
      success: false,
      error: {
        code: 'CALENDAR_EVENT_NOT_FOUND',
        message: 'Calendar event not found',
        statusCode: 404,
      },
    });
  });
});
