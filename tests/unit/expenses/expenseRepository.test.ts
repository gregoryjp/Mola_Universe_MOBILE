import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenseRepositoryImpl } from '@data/expenses/repositories/ExpenseRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const expenseDto = {
  id: 'e1',
  householdId: 'h1',
  description: 'Supermercado',
  amount: '42.50',
  currency: 'EUR',
  paidBy: 'u1',
  createdBy: 'u1',
  category: null,
  receiptReference: null,
  date: '2026-09-15T00:00:00.000Z',
  status: 'PENDING',
  totalPaid: '0.00',
  remainingAmount: '42.50',
  splits: [{ id: 's1', userId: 'u2', amount: '21.25', owedBy: 'u2' }],
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const paymentDto = {
  id: 'p1',
  expenseId: 'e1',
  paidByUserId: 'u2',
  paidToUserId: 'u1',
  amount: '21.25',
  currency: 'EUR',
  status: 'PENDING',
  confirmedAt: null,
  reversedAt: null,
  reversalReason: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new ExpenseRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ExpenseRepositoryImpl', () => {
  it('lists household expenses and maps the pagination', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ expenses: [expenseDto], total: 1, page: 1, limit: 20 }),
    );

    const result = await repo.listExpenses('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.expenses).toHaveLength(1);
      expect(result.value.total).toBe(1);
    }
  });

  it('serialises page/limit into the query string', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ expenses: [], total: 0, page: 2, limit: 5 }));

    await repo.listExpenses('h1', { page: 2, limit: 5 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses?page=2&limit=5`,
      expect.anything(),
    );
  });

  it('gets a single expense', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(expenseDto));

    await repo.getExpense('h1', 'e1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1`,
      expect.anything(),
    );
  });

  it('creates an expense with the serialised body', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(expenseDto, 201));

    await repo.createExpense('h1', { description: 'Supermercado', amount: '42.50', paidBy: 'u1' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ description: 'Supermercado', amount: '42.50', paidBy: 'u1' }),
      }),
    );
  });

  it('updates an expense via PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(expenseDto));

    await repo.updateExpense('h1', 'e1', { description: 'Cena' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ description: 'Cena' }) }),
    );
  });

  it('deletes an expense (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.deleteExpense('h1', 'e1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('fetches the summary from the /summary sub-path', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        householdId: 'h1',
        currency: 'EUR',
        totalExpenses: '42.50',
        totalPaid: '0.00',
        balances: [{ fromUserId: 'u2', toUserId: 'u1', amount: '21.25', payments: [paymentDto] }],
      }),
    );

    const result = await repo.getSummary('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/summary`,
      expect.anything(),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.balances[0]?.payments).toHaveLength(1);
  });

  it('creates a payment on the expense', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(paymentDto, 201));

    await repo.createPayment('h1', 'e1', { paidByUserId: 'u2', paidToUserId: 'u1', amount: '21.25' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1/payments`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ paidByUserId: 'u2', paidToUserId: 'u1', amount: '21.25' }),
      }),
    );
  });

  it('confirms a payment with an empty body when no idempotency key', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(paymentDto));

    await repo.confirmPayment('h1', 'e1', 'p1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1/payments/p1/confirm`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({}) }),
    );
  });

  it('forwards the idempotency key when confirming', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(paymentDto));

    await repo.confirmPayment('h1', 'e1', 'p1', 'key-1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1/payments/p1/confirm`,
      expect.objectContaining({ body: JSON.stringify({ idempotencyKey: 'key-1' }) }),
    );
  });

  it('reverses a payment with the reason included', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(paymentDto));

    await repo.reversePayment('h1', 'e1', 'p1', { reversalReason: 'duplicado' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/expenses/e1/payments/p1/reverse`,
      expect.objectContaining({ body: JSON.stringify({ reversalReason: 'duplicado' }) }),
    );
  });

  it('maps the backend error envelope (OVERPAYMENT)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'OVERPAYMENT', message: 'Payment exceeds remaining balance', statusCode: 409 },
        },
        409,
      ),
    );

    const result = await repo.createPayment('h1', 'e1', {
      paidByUserId: 'u2',
      paidToUserId: 'u1',
      amount: '999',
    });

    expect(result).toEqual({
      success: false,
      error: { code: 'OVERPAYMENT', message: 'Payment exceeds remaining balance', statusCode: 409 },
    });
  });
});
