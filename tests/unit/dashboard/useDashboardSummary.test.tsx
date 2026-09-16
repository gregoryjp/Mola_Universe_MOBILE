import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getSummary: vi.fn() }));

vi.mock('@data/dashboard/repositories/DashboardRepositoryImpl', () => ({
  dashboardRepository: { getSummary: mocks.getSummary },
}));

import type { DashboardSummary } from '@domain/dashboard/entities/DashboardSummary';
import { useDashboardSummary } from '@presentation/dashboard/hooks/useDashboardSummary';

const summary: DashboardSummary = {
  householdId: null,
  date: '2026-09-17',
  tasksToday: [],
  eventsToday: [],
  openShoppingLists: [],
  recentExpenses: [],
  meowSummary: 'Tienes 0 tarea(s) y 0 evento(s) hoy.',
};

let captured: ReturnType<typeof useDashboardSummary> | undefined;
const Harness = (): null => {
  captured = useDashboardSummary();
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
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
});

describe('useDashboardSummary', () => {
  it('loads the dashboard summary', async () => {
    mocks.getSummary.mockResolvedValueOnce({ success: true, value: summary });

    const renderer = await render();

    expect(mocks.getSummary).toHaveBeenCalled();
    expect(captured?.data?.meowSummary).toContain('0 tarea');

    renderer.unmount();
  });
});
