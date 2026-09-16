import { PetRepositoryImpl } from '@data/pets/repositories/PetRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const petDto = {
  id: 'p1',
  householdId: 'h1',
  name: 'Luna',
  species: 'Perro',
  breed: null,
  birthDate: null,
  ageYears: 6,
  photoUrl: null,
  weightKg: null,
  allergies: null,
  notes: null,
  microchipNumber: null,
  vetName: null,
  vetPhone: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
};

const recordDto = {
  id: 'm1',
  petId: 'p1',
  type: 'VACCINE',
  title: 'Rabia',
  notes: null,
  date: '2026-08-01T00:00:00.000Z',
  nextDueDate: null,
  createdBy: 'u1',
  createdAt: '2026-08-01T10:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new PetRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PetRepositoryImpl', () => {
  it('lists the pets of the household (flat array)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([petDto]));

    const result = await repo.listPets('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value[0]?.name).toBe('Luna');
  });

  it('creates a pet under the household', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(petDto, 201));

    const result = await repo.createPet('h1', { name: 'Luna', species: 'Perro' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Luna', species: 'Perro' }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.id).toBe('p1');
  });

  it('gets a single pet', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(petDto));

    const result = await repo.getPet('h1', 'p1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
  });

  it('updates a pet with PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...petDto, name: 'Luna II' }));

    const result = await repo.updatePet('h1', 'p1', { name: 'Luna II' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Luna II' }) }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.name).toBe('Luna II');
  });

  it('archives a pet (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.archivePet('h1', 'p1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('lists the explicit pet permissions of the household', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([{ householdId: 'h1', userId: 'u2', level: 'BASIC' }]));

    const result = await repo.listPermissions('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/permissions`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value[0]?.level).toBe('BASIC');
  });

  it('sets a member permission level with PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ householdId: 'h1', userId: 'u2', level: 'MEDICAL' }));

    const result = await repo.setPermission('h1', 'u2', 'MEDICAL');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/permissions/u2`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ level: 'MEDICAL' }) }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.level).toBe('MEDICAL');
  });

  it('lists the medical records of a pet', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([recordDto]));

    const result = await repo.listMedicalRecords('h1', 'p1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1/medical-records`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value[0]?.type).toBe('VACCINE');
  });

  it('creates a medical record', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(recordDto, 201));

    const result = await repo.createMedicalRecord('h1', 'p1', {
      type: 'VACCINE',
      title: 'Rabia',
      date: '2026-08-01',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1/medical-records`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ type: 'VACCINE', title: 'Rabia', date: '2026-08-01' }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('updates a medical record', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...recordDto, title: 'Rabia (2ª dosis)' }));

    const result = await repo.updateMedicalRecord('h1', 'p1', 'm1', { title: 'Rabia (2ª dosis)' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1/medical-records/m1`,
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result.success).toBe(true);
  });

  it('deletes a medical record (204)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.deleteMedicalRecord('h1', 'p1', 'm1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/pets/p1/medical-records/m1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('maps the insufficient-permission error', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PET_PERMISSION',
            message: 'Insufficient Pets permission level for this action',
            statusCode: 403,
          },
        },
        403,
      ),
    );

    const result = await repo.createPet('h1', { name: 'Luna', species: 'Perro' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'INSUFFICIENT_PET_PERMISSION',
        message: 'Insufficient Pets permission level for this action',
        statusCode: 403,
      },
    });
  });
});
