import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryRepositoryImpl } from '@data/inventory/repositories/InventoryRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const itemDto = {
  id: 'it1',
  createdBy: 'u1',
  scope: 'PERSONAL',
  name: 'Arroz',
  quantity: '5',
  unit: 'kg',
  lowThreshold: null,
  expiresAt: null,
  status: 'AVAILABLE',
  archivedAt: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const movementDto = {
  id: 'm1',
  itemId: 'it1',
  createdBy: 'u1',
  type: 'ADD',
  quantityDelta: '5',
  balanceAfter: '5',
  reason: null,
  reversalOfId: null,
  createdAt: '2026-09-15T00:00:00.000Z',
};

const movementResultDto = {
  movement: movementDto,
  item: itemDto,
  statusChanged: false,
  previousStatus: 'AVAILABLE',
  newStatus: 'AVAILABLE',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new InventoryRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('InventoryRepositoryImpl', () => {
  it('lists personal items from /users/inventory-items and maps the pagination', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ items: [itemDto], total: 1, page: 1, limit: 20 }));

    const result = await repo.listPersonalItems();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/inventory-items`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.total).toBe(1);
    }
  });

  it('lists household items from /households/:id/inventory-items', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ items: [], total: 0, page: 1, limit: 20 }));

    await repo.listHouseholdItems('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/inventory-items`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('gets a single item from /users/inventory-items/:itemId', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(itemDto));

    const result = await repo.getItem('it1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/users/inventory-items/it1`, expect.anything());
    expect(result.success).toBe(true);
  });

  it('creates a personal item via POST /users/inventory-items', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(itemDto, 201));

    await repo.createPersonalItem({ name: 'Arroz', unit: 'kg' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/inventory-items`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Arroz', unit: 'kg' }),
      }),
    );
  });

  it('creates a household item via POST /households/:id/inventory-items', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(itemDto, 201));

    await repo.createHouseholdItem('h1', { name: 'Arroz', unit: 'kg' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/inventory-items`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('archives an item via DELETE /users/inventory-items/:itemId (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.archiveItem('it1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/inventory-items/it1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('creates a movement via POST /inventory-items/:itemId/movements', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(movementResultDto, 201));

    await repo.createMovement('it1', { type: 'CONSUME', quantity: '1', unit: 'kg' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/inventory-items/it1/movements`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ type: 'CONSUME', quantity: '1', unit: 'kg' }),
      }),
    );
  });

  it('lists movements from /inventory-items/:itemId/movements', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([movementDto]));

    const result = await repo.listMovements('it1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/inventory-items/it1/movements`,
      expect.anything(),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toHaveLength(1);
  });

  it('reverses a movement via POST /inventory-items/:itemId/movements/:movementId/reverse', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(movementResultDto));

    await repo.reverseMovement('it1', 'm1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/inventory-items/it1/movements/m1/reverse`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({}) }),
    );
  });

  it('forwards the reversal reason when provided', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(movementResultDto));

    await repo.reverseMovement('it1', 'm1', 'Carga errónea');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/inventory-items/it1/movements/m1/reverse`,
      expect.objectContaining({ body: JSON.stringify({ reason: 'Carga errónea' }) }),
    );
  });

  it('maps the backend error envelope forwarded by the backend (non-2xx)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'ITEM_NOT_FOUND', message: 'Item not found', statusCode: 404 },
        },
        404,
      ),
    );

    const result = await repo.getItem('missing');

    expect(result).toEqual({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Item not found', statusCode: 404 },
    });
  });
});
