import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ create: vi.fn(), restock: vi.fn(), archive: vi.fn() }));

vi.mock('@data/expenses/recurring/repositories/RecurringExpenseRepositoryImpl', () => ({
  recurringExpenseRepository: {
    create: mocks.create,
    restock: mocks.restock,
    archive: mocks.archive,
  },
}));

import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import {
  useArchiveRecurringExpense,
  useCreateRecurringExpense,
  useRestockRecurringExpense,
} from '@presentation/expenses/recurring/hooks/useRecurringExpenseMutations';
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

const render = async <T,>(
  useHook: () => T,
): Promise<{ captured: () => T; renderer: ReactTestRenderer; client: QueryClient }> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let value: T | undefined;
  const Harness = (): null => {
    value = useHook();
    return null;
  };
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  const capturedRenderer = renderer;
  return {
    captured: () => {
      if (value === undefined) throw new Error('hook not captured');
      return value;
    },
    renderer: capturedRenderer,
    client,
  };
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: 'h1' });
});

describe('recurring expense mutation hooks', () => {
  it('creates a recurring expense in the active household and refreshes the list', async () => {
    mocks.create.mockResolvedValueOnce({ success: true, value: expense });
    const { captured, renderer, client } = await render(useCreateRecurringExpense);
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    await act(async () => {
      captured().mutate({ name: 'Detergente' });
    });
    await flush();

    expect(mocks.create).toHaveBeenCalledWith('h1', { name: 'Detergente' });
    expect(captured().data?.id).toBe('r1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['expenses', 'recurring', 'h1'] });

    renderer.unmount();
  });

  it('fails without calling the backend when no household is active', async () => {
    useHouseholdStore.setState({ activeHouseholdId: null });

    const { captured, renderer } = await render(useCreateRecurringExpense);

    await act(async () => {
      captured().mutate({ name: 'Detergente' });
    });
    await flush();

    expect(mocks.create).not.toHaveBeenCalled();
    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('NO_HOUSEHOLD');

    renderer.unmount();
  });

  it('restocks and exposes the new turn', async () => {
    mocks.restock.mockResolvedValueOnce({
      success: true,
      value: { ...expense, lastPurchasedBy: 'u1', currentTurnUserId: 'u2' },
    });

    const { captured, renderer } = await render(useRestockRecurringExpense);

    await act(async () => {
      captured().mutate({ recurringId: 'r1', input: { amount: '12.50' } });
    });
    await flush();

    expect(mocks.restock).toHaveBeenCalledWith('h1', 'r1', { amount: '12.50' });
    expect(captured().data?.currentTurnUserId).toBe('u2');

    renderer.unmount();
  });

  it('surfaces the 409 when restocking an archived expense', async () => {
    mocks.restock.mockResolvedValueOnce({
      success: false,
      error: {
        code: 'RECURRING_ALREADY_ARCHIVED',
        message: 'Recurring expense is already archived',
        statusCode: 409,
      },
    });

    const { captured, renderer } = await render(useRestockRecurringExpense);

    await act(async () => {
      captured().mutate({ recurringId: 'r1', input: { amount: '1.00' } });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('RECURRING_ALREADY_ARCHIVED');

    renderer.unmount();
  });

  it('archives a recurring expense by id', async () => {
    mocks.archive.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(useArchiveRecurringExpense);

    await act(async () => {
      captured().mutate('r1');
    });
    await flush();

    expect(mocks.archive).toHaveBeenCalledWith('h1', 'r1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('surfaces the 404 when archiving a missing expense', async () => {
    mocks.archive.mockResolvedValueOnce({
      success: false,
      error: {
        code: 'RECURRING_EXPENSE_NOT_FOUND',
        message: 'Recurring expense not found',
        statusCode: 404,
      },
    });

    const { captured, renderer } = await render(useArchiveRecurringExpense);

    await act(async () => {
      captured().mutate('missing');
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('RECURRING_EXPENSE_NOT_FOUND');

    renderer.unmount();
  });
});
