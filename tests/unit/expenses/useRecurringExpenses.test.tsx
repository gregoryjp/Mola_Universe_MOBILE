import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ list: vi.fn() }));

vi.mock('@data/expenses/recurring/repositories/RecurringExpenseRepositoryImpl', () => ({
  recurringExpenseRepository: { list: mocks.list },
}));

import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import { useRecurringExpenses } from '@presentation/expenses/recurring/hooks/useRecurringExpenses';
import { useHouseholdStore } from '@shared/store/householdStore';

const expense: RecurringExpense = {
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

let captured: ReturnType<typeof useRecurringExpenses> | undefined;
const Harness = (): null => {
  captured = useRecurringExpenses();
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
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('useRecurringExpenses', () => {
  it('loads the recurring expenses of the active household', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.list.mockResolvedValueOnce({ success: true, value: [expense] });

    const renderer = await render();

    expect(mocks.list).toHaveBeenCalledWith('h1');
    expect(captured?.data).toHaveLength(1);
    expect(captured?.data?.[0]?.name).toBe('Detergente');

    renderer.unmount();
  });

  it('stays idle (no request) when no household is active', async () => {
    const renderer = await render();

    expect(mocks.list).not.toHaveBeenCalled();
    expect(captured?.fetchStatus).toBe('idle');

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.list.mockResolvedValueOnce({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not a member', statusCode: 403 },
    });

    const renderer = await render();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('UNAUTHORIZED');

    renderer.unmount();
  });
});
