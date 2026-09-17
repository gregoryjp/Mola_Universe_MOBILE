import { MomentRepositoryImpl } from '@data/moments/repositories/MomentRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const momentDto = {
  id: 'm1',
  householdId: 'h1',
  createdBy: 'u1',
  type: 'EVENT',
  title: 'Cena en casa',
  description: 'Traed algo para picar',
  eventDate: '2026-09-20T18:00:00.000Z',
  detail: null,
  status: 'OPEN',
  calendarEventId: 'c1',
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
};

const participantDto = {
  id: 'p1',
  momentId: 'm1',
  userId: 'u1',
  response: 'PENDING',
  respondedAt: null,
};

const inviteDto = {
  id: 'i1',
  momentId: 'm1',
  email: 'ana@ejemplo.com',
  name: 'Ana',
  isMolaUser: false,
  status: 'INVITED',
  invitedAt: '2026-09-17T09:00:00.000Z',
  respondedAt: null,
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const noContentResponse = (): Response =>
  ({ status: 204, ok: true, json: async () => undefined }) as unknown as Response;

const repo = new MomentRepositoryImpl();

/** Body of the last fetch call, parsed back from the request. */
const lastBody = (fetchMock: ReturnType<typeof vi.mocked<typeof fetch>>): unknown => {
  const calls = fetchMock.mock.calls;
  const init = calls[calls.length - 1]?.[1] as RequestInit | undefined;
  return init?.body === undefined ? undefined : JSON.parse(init.body as string);
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MomentRepositoryImpl', () => {
  it('lists the moments of a household as a flat array', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([momentDto]));

    const result = await repo.listMoments('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.type).toBe('EVENT');
      expect(result.value[0]?.calendarEventId).toBe('c1');
    }
  });

  it('gets a moment with its participants', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...momentDto, participants: [participantDto] }),
    );

    const result = await repo.getMoment('h1', 'm1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments/m1`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.participants).toEqual([
        {
          id: 'p1',
          momentId: 'm1',
          userId: 'u1',
          response: 'PENDING',
          respondedAt: null,
        },
      ]);
    }
  });

  it('creates a moment and sends only the fields the caller defined', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(momentDto, 201));

    const result = await repo.createMoment('h1', {
      type: 'EVENT',
      title: 'Cena en casa',
      eventDate: '2026-09-20T18:00:00.000Z',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments`,
      expect.objectContaining({ method: 'POST' }),
    );
    // The backend schema is `additionalProperties: false`, so omitted optional
    // fields must not travel as `undefined`.
    expect(lastBody(fetchMock)).toEqual({
      type: 'EVENT',
      title: 'Cena en casa',
      eventDate: '2026-09-20T18:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('updates a moment with PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...momentDto, status: 'CANCELLED' }));

    const result = await repo.updateMoment('h1', 'm1', { status: 'CANCELLED' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments/m1`,
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(lastBody(fetchMock)).toEqual({ status: 'CANCELLED' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.status).toBe('CANCELLED');
  });

  it('deletes a moment and treats the 204 as success', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(noContentResponse());

    const result = await repo.deleteMoment('h1', 'm1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments/m1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('answers an RSVP with the two values the backend accepts', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...participantDto, response: 'GOING', respondedAt: '2026-09-17T10:00:00.000Z' }),
    );

    const result = await repo.respondToMoment('h1', 'm1', 'GOING');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments/m1/respond`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(lastBody(fetchMock)).toEqual({ response: 'GOING' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.response).toBe('GOING');
  });

  it('lists the external invites without ever exposing an invite token', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([inviteDto]));

    const result = await repo.listExternalInvites('h1', 'm1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments/m1/invites`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value[0]).toEqual({
        id: 'i1',
        momentId: 'm1',
        email: 'ana@ejemplo.com',
        name: 'Ana',
        isMolaUser: false,
        status: 'INVITED',
        invitedAt: '2026-09-17T09:00:00.000Z',
        respondedAt: null,
      });
      expect(result.value[0]).not.toHaveProperty('inviteToken');
    }
  });

  it('creates an external invite with email and optional name', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(inviteDto, 201));

    await repo.createExternalInvite('h1', 'm1', { email: 'ana@ejemplo.com' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/moments/m1/invites`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(lastBody(fetchMock)).toEqual({ email: 'ana@ejemplo.com' });
  });

  it('normalises a backend error envelope', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'MOMENT_NOT_FOUND', message: 'Moment not found', statusCode: 404 } },
        404,
      ),
    );

    const result = await repo.getMoment('h1', 'missing');

    expect(result).toEqual({
      success: false,
      error: { code: 'MOMENT_NOT_FOUND', message: 'Moment not found', statusCode: 404 },
    });
  });

  it('maps a 403 from the creator-only guard', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized', statusCode: 403 } },
        403,
      ),
    );

    const result = await repo.deleteMoment('h1', 'm1');

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.statusCode).toBe(403);
  });
});
