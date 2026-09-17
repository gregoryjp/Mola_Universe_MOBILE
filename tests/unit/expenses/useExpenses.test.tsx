import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ listExpenses: vi.fn(), getSummary: vi.fn() }));

vi.mock('@data/expenses/repositories/ExpenseRepositoryImpl', () => ({
  expenseRepository: { listExpenses: mocks.listExpenses, getSummary: mocks.getSummary },
}));

import type { PaginatedExpenses } from '@domain/expenses/repositories/ExpenseRepository';
import { useExpenses } from '@presentation/expenses/hooks/useExpenses';
import { useHouseholdStore } from '@shared/store/householdStore';

import { flushQueries } from '../../helpers/flush';

const page: PaginatedExpenses = {
  expenses: [
    {
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
      splits: [],
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

let captured: ReturnType<typeof useExpenses> | undefined;
const Harness = (): null => {
  captured = useExpenses();
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
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('useExpenses', () => {
  it('loads household expenses when a household is active', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listExpenses.mockResolvedValueOnce({ success: true, value: page });

    const renderer = await render();

    expect(mocks.listExpenses).toHaveBeenCalledWith('h1', { page: 1 });
    expect(captured?.expenses).toHaveLength(1);

    renderer.unmount();
  });

  it('stays idle (no request) when no household is active', async () => {
    const renderer = await render();

    expect(mocks.listExpenses).not.toHaveBeenCalled();
    expect(captured?.fetchStatus).toBe('idle');

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listExpenses.mockResolvedValueOnce({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not a member', statusCode: 403 },
    });

    const renderer = await render();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('UNAUTHORIZED');

    renderer.unmount();
  });
});
