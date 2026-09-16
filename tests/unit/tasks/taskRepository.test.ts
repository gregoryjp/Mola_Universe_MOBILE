import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskRepositoryImpl } from '@data/tasks/repositories/TaskRepositoryImpl';

const BASE = 'http://localhost:3000/api/v1';

const taskDto = {
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
  dueDate: '2026-09-20T00:00:00.000Z',
  completedAt: null,
  completedBy: null,
  approvedAt: null,
  approvedBy: null,
  requiresApproval: false,
  isOverdue: false,
  recurrence: 'NONE',
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

const repo = new TaskRepositoryImpl();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TaskRepositoryImpl', () => {
  it('lists personal tasks from /users/tasks and maps the pagination', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ tasks: [taskDto], total: 1, page: 1, limit: 20 }),
    );

    const result = await repo.listPersonal();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/users/tasks`, expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual({
      success: true,
      value: {
        tasks: [{ ...taskDto, assignedTo: null }],
        total: 1,
        page: 1,
        limit: 20,
      },
    });
  });

  it('serialises list params into the query string', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ tasks: [], total: 0, page: 2, limit: 5 }));

    await repo.listPersonal({ page: 2, limit: 5, status: 'PENDING' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/tasks?page=2&limit=5&status=PENDING`,
      expect.anything(),
    );
  });

  it('gets a single task from /users/tasks/:taskId', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(taskDto));

    const result = await repo.getTask('t1');

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/users/tasks/t1`, expect.anything());
    expect(result.success).toBe(true);
  });

  it('creates a personal task via POST /users/tasks', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(taskDto, 201));

    await repo.createPersonal({ title: 'Limpiar cocina', dueDate: '2026-09-20' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/tasks`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Limpiar cocina', dueDate: '2026-09-20' }),
      }),
    );
  });

  it('completes a task via PATCH /users/tasks/:taskId/complete', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(taskDto));

    await repo.complete('t1', { approveTask: true });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/tasks/t1/complete`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ approveTask: true }) }),
    );
  });

  it('deletes a task via DELETE /users/tasks/:taskId (204, no body)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));

    const result = await repo.remove('t1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/users/tasks/t1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ success: true, value: undefined });
  });

  it('lists household tasks from /households/:id/tasks', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ tasks: [], total: 0, page: 1, limit: 20 }));

    await repo.listHousehold('h1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/tasks`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates a household task via POST /households/:id/tasks', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(taskDto, 201));

    await repo.createHousehold('h1', { title: 'Sacar basura', dueDate: '2026-09-20' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/tasks`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('reassigns via PATCH /households/:id/tasks/:taskId/assign', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse(taskDto));

    await repo.assign('h1', 't1', 'u2');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/households/h1/tasks/t1/assign`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ assignedTo: 'u2' }) }),
    );
  });

  it('maps the error envelope forwarded by the backend (non-2xx)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found', statusCode: 404 } },
        404,
      ),
    );

    const result = await repo.getTask('missing');

    expect(result).toEqual({
      success: false,
      error: { code: 'TASK_NOT_FOUND', message: 'Task not found', statusCode: 404 },
    });
  });
});
