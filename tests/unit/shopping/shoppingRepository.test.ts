import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShoppingRepositoryImpl } from '@data/shopping/repositories/ShoppingRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const listDto = {
  id: 'l1',
  createdBy: 'u1',
  scope: 'PERSONAL',
  name: 'Semana',
  notes: null,
  status: 'OPEN',
  completedAt: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const itemDto = {
  id: 'i1',
  listId: 'l1',
  addedBy: 'u1',
  name: 'Leche',
  quantity: '2',
  unit: 'l',
  notes: null,
  status: 'PENDING',
  purchasedBy: null,
  purchasedAt: null,
  copiedFromItemId: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new ShoppingRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ShoppingRepositoryImpl', () => {
  it('lists personal lists from /users/shopping-lists and maps the pagination', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ lists: [listDto], total: 1, page: 1, limit: 20 }));

    const result = await repo.listPersonalLists();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/shopping-lists`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual({
      success: true,
      value: {
        lists: [{ ...listDto, householdId: null }],
        total: 1,
        page: 1,
        limit: 20,
      },
    });
  });

  it('serialises list params into the query string', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ lists: [], total: 0, page: 2, limit: 5 }));

    await repo.listPersonalLists({ page: 2, limit: 5 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/shopping-lists?page=2&limit=5`,
      expect.anything(),
    );
  });

  it('lists household lists from /households/:id/shopping-lists', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ lists: [], total: 0, page: 1, limit: 20 }));

    await repo.listHouseholdLists('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/shopping-lists`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates a personal list via POST /users/shopping-lists', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(listDto, 201));

    await repo.createPersonalList({ name: 'Semana' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/shopping-lists`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Semana' }) }),
    );
  });

  it('creates a household list via POST /households/:id/shopping-lists', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(listDto, 201));

    await repo.createHouseholdList('h1', { name: 'Casa' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/shopping-lists`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('lists items from /shopping-lists/:listId/items', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([itemDto]));

    const result = await repo.listItems('l1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/shopping-lists/l1/items`, expect.anything());
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toHaveLength(1);
  });

  it('adds an item via POST /shopping-lists/:listId/items with duplicate suggestions', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ item: itemDto, duplicateSuggestions: [itemDto] }, 201),
    );

    const result = await repo.addItem('l1', { name: 'Leche', quantity: '2', unit: 'l' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/shopping-lists/l1/items`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Leche', quantity: '2', unit: 'l' }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.duplicateSuggestions).toHaveLength(1);
  });

  it('purchases an item via PATCH /shopping-lists/:listId/items/:itemId/purchase', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(itemDto));

    await repo.purchaseItem('l1', 'i1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/shopping-lists/l1/items/i1/purchase`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('reopens an item via PATCH /shopping-lists/:listId/items/:itemId/reopen', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(itemDto));

    await repo.reopenItem('l1', 'i1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/shopping-lists/l1/items/i1/reopen`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('deletes an item via DELETE (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.deleteItem('l1', 'i1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/shopping-lists/l1/items/i1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('maps the backend error envelope forwarded by the backend (non-2xx)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'SHOPPING_LIST_NOT_FOUND', message: 'List not found', statusCode: 404 },
        },
        404,
      ),
    );

    const result = await repo.listItems('missing');

    expect(result).toEqual({
      success: false,
      error: { code: 'SHOPPING_LIST_NOT_FOUND', message: 'List not found', statusCode: 404 },
    });
  });
});
