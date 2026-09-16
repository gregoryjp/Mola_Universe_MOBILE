import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdRepositoryImpl } from '@data/households/repositories/HouseholdRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const householdDto = {
  id: 'h1',
  name: 'Casa',
  description: null,
  ownerId: 'u1',
  memberCount: 3,
  createdAt: '2026-09-15T00:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new HouseholdRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HouseholdRepositoryImpl', () => {
  it('lists the user households from /households and maps them', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([householdDto]));

    const result = await repo.listMyHouseholds();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/households`, expect.anything());
    expect(result).toEqual({
      success: true,
      value: [{ ...householdDto, description: null }],
    });
  });

  it('maps the backend error envelope forwarded by the backend (non-2xx)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Unauthorized', statusCode: 401 },
        },
        401,
      ),
    );

    const result = await repo.listMyHouseholds();

    expect(result).toEqual({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized', statusCode: 401 },
    });
  });

  it('creates a household via POST /households (omitting an absent description)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(householdDto, 201));

    const result = await repo.createHousehold({ name: 'Casa' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Casa' }) }),
    );
    expect(result).toEqual({
      success: true,
      value: { ...householdDto, description: null },
    });
  });

  it('forwards the optional description when provided', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...householdDto, description: 'La de la playa' }, 201),
    );

    await repo.createHousehold({ name: 'Playa', description: 'La de la playa' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households`,
      expect.objectContaining({
        body: JSON.stringify({ name: 'Playa', description: 'La de la playa' }),
      }),
    );
  });

  it('maps the backend error envelope on create (MAX_HOUSEHOLDS)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'MAX_HOUSEHOLDS', message: 'Max households reached', statusCode: 400 },
        },
        400,
      ),
    );

    const result = await repo.createHousehold({ name: 'Casa' });

    expect(result).toEqual({
      success: false,
      error: { code: 'MAX_HOUSEHOLDS', message: 'Max households reached', statusCode: 400 },
    });
  });
});
