import { SosRepositoryImpl } from '@data/sos/repositories/SosRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const contactDto = {
  id: 'c1',
  name: 'Ana',
  email: 'ana@example.com',
  phone: null,
  isMolaUser: true,
  pushEnabled: true,
  verified: false,
  createdAt: '2026-09-17T09:00:00.000Z',
};

const eventDto = {
  id: 's1',
  status: 'PENDING',
  message: 'Ayuda',
  locationLat: null,
  locationLng: null,
  activatedAt: '2026-09-17T09:00:00.000Z',
  dispatchedAt: null,
  cancelledAt: null,
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new SosRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SosRepositoryImpl', () => {
  it('lists the trusted contacts (flat array)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([contactDto]));

    const result = await repo.listContacts();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/sos/contacts`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.email).toBe('ana@example.com');
    }
  });

  it('creates a contact and omits the phone when not provided', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(contactDto, 201));

    const result = await repo.createContact({ name: 'Ana', email: 'ana@example.com' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/sos/contacts`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Ana', email: 'ana@example.com' }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('deletes a contact (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.deleteContact('c1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/sos/contacts/c1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('activates the alert and keeps the cancellation window', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...eventDto, cancelWindowMs: 15000 }, 201));

    const result = await repo.activate({ message: 'Ayuda' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/sos/activate`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ message: 'Ayuda' }) }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.cancelWindowMs).toBe(15000);
  });

  it('sends the event id in the body when cancelling', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...eventDto, status: 'CANCELLED' }));

    const result = await repo.cancel('s1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/sos/cancel`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ sosEventId: 's1' }) }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.status).toBe('CANCELLED');
  });

  it('lists the history', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([eventDto]));

    const result = await repo.history();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/sos/history`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
  });

  it('maps a 404 on contact deletion (CONTACT_NOT_FOUND)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'CONTACT_NOT_FOUND', message: 'Trusted contact not found', statusCode: 404 },
        },
        404,
      ),
    );

    const result = await repo.deleteContact('missing');

    expect(result).toEqual({
      success: false,
      error: { code: 'CONTACT_NOT_FOUND', message: 'Trusted contact not found', statusCode: 404 },
    });
  });

  it('maps a 409 when the cancellation window is over', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'SOS_ALREADY_DISPATCHED', message: 'SOS already dispatched', statusCode: 409 },
        },
        409,
      ),
    );

    const result = await repo.cancel('s1');

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SOS_ALREADY_DISPATCHED');
  });

  it('maps the empty contact list', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    const result = await repo.listContacts();

    expect(result).toEqual({ success: true, value: [] });
  });
});
