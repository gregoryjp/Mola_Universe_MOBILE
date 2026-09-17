import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({ listPersonal: vi.fn() }));

vi.mock('@data/tasks/repositories/TaskRepositoryImpl', () => ({
  taskRepository: { listPersonal: mocks.listPersonal },
}));

import type { Task } from '@domain/tasks/entities/Task';
import { useTasksList } from '@presentation/tasks/hooks/useTasksList';

const task: Task = {
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

let captured: ReturnType<typeof useTasksList> | undefined;
const Harness = (): null => {
  captured = useTasksList();
  return null;
};

const render = async (): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await flushQueries();
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
});

describe('useTasksList', () => {
  it('loads personal tasks', async () => {
    mocks.listPersonal.mockResolvedValueOnce({
      success: true,
      value: { tasks: [task], total: 1, page: 1, limit: 20 },
    });

    const renderer = await render();

    expect(mocks.listPersonal).toHaveBeenCalled();
    expect(captured?.tasks).toHaveLength(1);
    expect(captured?.data?.pages[0]?.total).toBe(1);

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    mocks.listPersonal.mockResolvedValueOnce({
      success: false,
      error: { code: 'TASK_NOT_FOUND', message: 'Task not found', statusCode: 404 },
    });

    const renderer = await render();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('TASK_NOT_FOUND');

    renderer.unmount();
  });
});
