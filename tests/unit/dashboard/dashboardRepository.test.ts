import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardRepositoryImpl } from '@data/dashboard/repositories/DashboardRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const summaryDto = {
  householdId: null,
  date: '2026-09-17',
  tasksToday: [
    {
      id: 't1',
      createdBy: 'u1',
      assignedTo: null,
      title: 'Limpiar cocina',
      description: null,
      scope: 'PERSONAL',
      householdId: null,
      category: 'GENERAL',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '2026-09-17T10:00:00.000Z',
      completedAt: null,
      completedBy: null,
      approvedAt: null,
      approvedBy: null,
      requiresApproval: false,
      isOverdue: false,
      recurrence: 'NONE',
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    },
  ],
  eventsToday: [
    { id: 'e1', title: 'Cumple', type: 'BIRTHDAY', startAt: '2026-09-17T18:00:00.000Z', endAt: null },
  ],
  openShoppingLists: [{ id: 'l1', name: 'Super', status: 'OPEN' }],
  recentExpenses: [
    { id: 'x1', description: 'Luz', amount: '50.00', currency: 'EUR', date: '2026-09-16' },
  ],
  meowSummary: 'Tienes 1 tarea(s) y 1 evento(s) hoy. Además, 1 lista(s) de compras abierta(s).',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new DashboardRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DashboardRepositoryImpl', () => {
  it('GETs /dashboard and maps the summary (tasks via the tasks mapper)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(summaryDto));

    const result = await repo.getSummary();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/dashboard`, expect.objectContaining({ method: 'GET' }));
    if (!result.success) throw new Error('expected success');
    expect(result.value.tasksToday[0]?.title).toBe('Limpiar cocina');
    expect(result.value.eventsToday[0]).toEqual({
      id: 'e1',
      title: 'Cumple',
      type: 'BIRTHDAY',
      startAt: '2026-09-17T18:00:00.000Z',
      endAt: null,
    });
    expect(result.value.openShoppingLists[0]?.status).toBe('OPEN');
    expect(result.value.meowSummary).toContain('1 tarea');
  });

  it('appends householdId to the path when provided', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...summaryDto, householdId: 'h1' }));

    await repo.getSummary('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/dashboard?householdId=h1`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('propagates the forwarded error envelope', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal error', statusCode: 500 } },
        500,
      ),
    );

    const result = await repo.getSummary();

    expect(result).toEqual({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal error', statusCode: 500 },
    });
  });
});
