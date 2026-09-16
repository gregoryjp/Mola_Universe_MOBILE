import { RecurringExpenseRepositoryImpl } from '@data/expenses/recurring/repositories/RecurringExpenseRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const dto = {
  id: 'r1',
  householdId: 'h1',
  name: 'Detergente',
  category: null,
  currency: 'EUR',
  lastPurchasedBy: null,
  lastPurchasedAt: null,
  currentTurnUserId: 'u1',
  createdAt: '2026-09-17T09:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new RecurringExpenseRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RecurringExpenseRepositoryImpl', () => {
  it('lists the recurring expenses of the household (flat array)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([dto]));

    const result = await repo.list('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/recurring-expenses`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value[0]?.currentTurnUserId).toBe('u1');
  });

  it('creates a recurring expense omitting the optional fields', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(dto, 201));

    const result = await repo.create('h1', { name: 'Detergente' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/recurring-expenses`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Detergente' }) }),
    );
    expect(result.success).toBe(true);
  });

  it('restocks with the amount as a decimal string', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...dto, lastPurchasedBy: 'u1', currentTurnUserId: 'u2' }),
    );

    const result = await repo.restock('h1', 'r1', { amount: '12.50' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/recurring-expenses/r1/restock`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ amount: '12.50' }) }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.currentTurnUserId).toBe('u2');
  });

  it('archives with DELETE (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.archive('h1', 'r1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/recurring-expenses/r1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('maps a 404 on restock (RECURRING_EXPENSE_NOT_FOUND)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'RECURRING_EXPENSE_NOT_FOUND',
            message: 'Recurring expense not found',
            statusCode: 404,
          },
        },
        404,
      ),
    );

    const result = await repo.restock('h1', 'missing', { amount: '1.00' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'RECURRING_EXPENSE_NOT_FOUND',
        message: 'Recurring expense not found',
        statusCode: 404,
      },
    });
  });

  it('maps a 409 on archiving an already archived expense', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'RECURRING_ALREADY_ARCHIVED',
            message: 'Recurring expense is already archived',
            statusCode: 409,
          },
        },
        409,
      ),
    );

    const result = await repo.archive('h1', 'r1');

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('RECURRING_ALREADY_ARCHIVED');
  });

  it('maps a 403 when the user is not a household member', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not a member', statusCode: 403 } },
        403,
      ),
    );

    const result = await repo.list('h9');

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.statusCode).toBe(403);
  });
});
