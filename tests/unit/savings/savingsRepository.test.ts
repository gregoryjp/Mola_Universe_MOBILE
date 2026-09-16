import { SavingsRepositoryImpl } from '@data/savings/repositories/SavingsRepositoryImpl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = 'http://localhost:3000/api/v1';

const goalDto = {
  id: 'g1',
  createdBy: 'u1',
  scope: 'HOUSEHOLD',
  householdId: 'h1',
  name: 'Vacaciones',
  notes: null,
  targetAmount: '1200.00',
  currency: 'EUR',
  boardPreset: 'MEDIUM',
  contributionMode: null,
  quotaAmount: null,
  savedAmount: '0.00',
  status: 'OPEN',
  completedAt: null,
  cancelledAt: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const cellDto = {
  id: 'c1',
  goalId: 'g1',
  denomination: '50.00',
  position: 1,
  isMarked: false,
  markedBy: null,
  markedAt: null,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const movementDto = {
  id: 'm1',
  goalId: 'g1',
  cellId: 'c1',
  createdBy: 'u1',
  type: 'MARK',
  amount: '50.00',
  balanceAfter: '50.00',
  reversalOfId: null,
  createdAt: '2026-09-15T00:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new SavingsRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SavingsRepositoryImpl', () => {
  it('lists personal goals and maps the pagination', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ goals: [goalDto], total: 1, page: 1, limit: 20 }));

    const result = await repo.listPersonalGoals();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/savings-goals`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.total).toBe(1);
  });

  it('serialises page/limit on the personal list', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ goals: [], total: 0, page: 2, limit: 5 }));

    await repo.listPersonalGoals({ page: 2, limit: 5 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/savings-goals?page=2&limit=5`,
      expect.anything(),
    );
  });

  it('creates a personal goal with the serialised body', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(goalDto, 201));

    await repo.createPersonalGoal({
      name: 'Vacaciones',
      targetAmount: '1200.00',
      currency: 'EUR',
      boardPreset: 'MEDIUM',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/savings-goals`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Vacaciones',
          targetAmount: '1200.00',
          currency: 'EUR',
          boardPreset: 'MEDIUM',
        }),
      }),
    );
  });

  it('gets a single goal', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(goalDto));

    await repo.getGoal('g1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/users/savings-goals/g1`, expect.anything());
  });

  it('deletes a goal (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.deleteGoal('g1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/savings-goals/g1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('lists household goals under the household scope', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ goals: [goalDto], total: 1, page: 1, limit: 20 }));

    await repo.listHouseholdGoals('h1', { page: 1, limit: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/savings-goals?page=1&limit=10`,
      expect.anything(),
    );
  });

  it('creates a household goal under the household scope', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(goalDto, 201));

    await repo.createHouseholdGoal('h1', {
      name: 'Coche',
      targetAmount: '5000.00',
      currency: 'EUR',
      boardPreset: 'LARGE',
      contributionMode: 'FREE',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/savings-goals`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Coche',
          targetAmount: '5000.00',
          currency: 'EUR',
          boardPreset: 'LARGE',
          contributionMode: 'FREE',
        }),
      }),
    );
  });

  it('lists the goal cells', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([cellDto]));

    const result = await repo.listCells('g1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/savings-goals/g1/cells`, expect.anything());
    expect(result.success).toBe(true);
    if (result.success) expect(result.value[0]?.denomination).toBe('50.00');
  });

  it('marks a cell via PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        movement: movementDto,
        cell: { ...cellDto, isMarked: true },
        goal: goalDto,
        statusChanged: false,
        previousStatus: 'OPEN',
        newStatus: 'OPEN',
      }),
    );

    const result = await repo.markCell('g1', 'c1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/savings-goals/g1/cells/c1/mark`,
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.cell.isMarked).toBe(true);
  });

  it('unmarks a cell via PATCH', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        movement: { ...movementDto, type: 'REVERSAL', reversalOfId: 'm1' },
        cell: { ...cellDto, isMarked: false },
        goal: goalDto,
        statusChanged: false,
        previousStatus: 'OPEN',
        newStatus: 'OPEN',
      }),
    );

    const result = await repo.unmarkCell('g1', 'c1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/savings-goals/g1/cells/c1/unmark`,
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.movement.type).toBe('REVERSAL');
  });

  it('lists the goal movements', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse([movementDto]));

    const result = await repo.listMovements('g1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/savings-goals/g1/movements`,
      expect.anything(),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toHaveLength(1);
  });

  it('creates a contribution with the month serialised', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          id: 'ct1',
          savingsGoalId: 'g1',
          userId: 'u1',
          amount: '25.00',
          month: '2026-09',
          createdAt: '2026-09-15T00:00:00.000Z',
        },
        201,
      ),
    );

    const result = await repo.createContribution('g1', { amount: '25.00', month: '2026-09' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/savings-goals/g1/contributions`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ amount: '25.00', month: '2026-09' }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.month).toBe('2026-09');
  });

  it('omits the month on a FREE contribution', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          id: 'ct2',
          savingsGoalId: 'g1',
          userId: 'u1',
          amount: '25.00',
          month: null,
          createdAt: '2026-09-15T00:00:00.000Z',
        },
        201,
      ),
    );

    await repo.createContribution('g1', { amount: '25.00' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/savings-goals/g1/contributions`,
      expect.objectContaining({ body: JSON.stringify({ amount: '25.00' }) }),
    );
  });

  it('lists contributions', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          id: 'ct1',
          savingsGoalId: 'g1',
          userId: 'u1',
          amount: '25.00',
          month: null,
          createdAt: '2026-09-15T00:00:00.000Z',
        },
      ]),
    );

    const result = await repo.listContributions('g1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/savings-goals/g1/contributions`,
      expect.anything(),
    );
    expect(result.success).toBe(true);
  });

  it('maps the backend error envelope (GOAL_NOT_FOUND)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found', statusCode: 404 },
        },
        404,
      ),
    );

    const result = await repo.getGoal('missing');

    expect(result).toEqual({
      success: false,
      error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found', statusCode: 404 },
    });
  });
});
