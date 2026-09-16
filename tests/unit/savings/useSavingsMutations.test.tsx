import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createHouseholdGoal: vi.fn(),
  createPersonalGoal: vi.fn(),
  deleteGoal: vi.fn(),
  markCell: vi.fn(),
  createContribution: vi.fn(),
}));

vi.mock('@data/savings/repositories/SavingsRepositoryImpl', () => ({
  savingsRepository: {
    createHouseholdGoal: mocks.createHouseholdGoal,
    createPersonalGoal: mocks.createPersonalGoal,
    deleteGoal: mocks.deleteGoal,
    markCell: mocks.markCell,
    createContribution: mocks.createContribution,
  },
}));

import type { SavingsGoal } from '@domain/savings/entities/SavingsGoal';
import {
  useCreateSavingsGoal,
  useCreateContribution,
  useDeleteSavingsGoal,
  useMarkCell,
} from '@presentation/savings/hooks/useSavingsMutations';
import { useHouseholdStore } from '@shared/store/householdStore';

const goal: SavingsGoal = {
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

const markResult = {
  movement: {
    id: 'm1',
    goalId: 'g1',
    cellId: 'c1',
    createdBy: 'u1',
    type: 'MARK' as const,
    amount: '50.00',
    balanceAfter: '50.00',
    reversalOfId: null,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  cell: {
    id: 'c1',
    goalId: 'g1',
    denomination: '50.00',
    position: 1,
    isMarked: true,
    markedBy: 'u1',
    markedAt: null,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  goal,
  statusChanged: false,
  previousStatus: 'OPEN' as const,
  newStatus: 'OPEN' as const,
};

const render = async <T,>(useHook: () => T): Promise<{ captured: () => T; renderer: ReactTestRenderer }> => {
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
  };
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('savings mutation hooks', () => {
  it('creates a household goal under the active household', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.createHouseholdGoal.mockResolvedValueOnce({ success: true, value: goal });

    const { captured, renderer } = await render(useCreateSavingsGoal);

    await act(async () => {
      captured().mutate({
        scope: 'HOUSEHOLD',
        input: { name: 'Vacaciones', targetAmount: '1200.00', currency: 'EUR', boardPreset: 'MEDIUM' },
      });
    });
    await flush();

    expect(mocks.createHouseholdGoal).toHaveBeenCalledWith('h1', {
      name: 'Vacaciones',
      targetAmount: '1200.00',
      currency: 'EUR',
      boardPreset: 'MEDIUM',
    });
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('creates a personal goal without touching the household', async () => {
    mocks.createPersonalGoal.mockResolvedValueOnce({ success: true, value: goal });

    const { captured, renderer } = await render(useCreateSavingsGoal);

    await act(async () => {
      captured().mutate({
        scope: 'PERSONAL',
        input: { name: 'Moto', targetAmount: '800.00', currency: 'EUR', boardPreset: 'SMALL' },
      });
    });
    await flush();

    expect(mocks.createPersonalGoal).toHaveBeenCalled();
    expect(mocks.createHouseholdGoal).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('refuses a household goal when no household is active', async () => {
    const { captured, renderer } = await render(useCreateSavingsGoal);

    await act(async () => {
      captured().mutate({
        scope: 'HOUSEHOLD',
        input: { name: 'X', targetAmount: '10.00', currency: 'EUR', boardPreset: 'SMALL' },
      });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('NO_HOUSEHOLD');

    renderer.unmount();
  });

  it('surfaces the backend error on create', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.createHouseholdGoal.mockResolvedValueOnce({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid denominations', statusCode: 400 },
    });

    const { captured, renderer } = await render(useCreateSavingsGoal);

    await act(async () => {
      captured().mutate({
        scope: 'HOUSEHOLD',
        input: { name: 'X', targetAmount: '10.00', currency: 'EUR', boardPreset: 'CUSTOM' },
      });
    });
    await flush();

    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('VALIDATION_ERROR');

    renderer.unmount();
  });

  it('deletes a goal', async () => {
    mocks.deleteGoal.mockResolvedValueOnce({ success: true, value: undefined });

    const { captured, renderer } = await render(useDeleteSavingsGoal);

    await act(async () => {
      captured().mutate('g1');
    });
    await flush();

    expect(mocks.deleteGoal).toHaveBeenCalledWith('g1');
    expect(captured().isSuccess).toBe(true);

    renderer.unmount();
  });

  it('marks a cell', async () => {
    mocks.markCell.mockResolvedValueOnce({ success: true, value: markResult });

    const { captured, renderer } = await render(() => useMarkCell('g1'));

    await act(async () => {
      captured().mutate('c1');
    });
    await flush();

    expect(mocks.markCell).toHaveBeenCalledWith('g1', 'c1');
    expect(captured().data?.cell.isMarked).toBe(true);

    renderer.unmount();
  });

  it('creates a contribution and surfaces errors', async () => {
    mocks.createContribution.mockResolvedValueOnce({
      success: false,
      error: { code: 'QUOTA_EXCEEDED', message: 'Quota exceeded', statusCode: 409 },
    });

    const { captured, renderer } = await render(() => useCreateContribution('g1'));

    await act(async () => {
      captured().mutate({ amount: '500.00', month: '2026-09' });
    });
    await flush();

    expect(mocks.createContribution).toHaveBeenCalledWith('g1', { amount: '500.00', month: '2026-09' });
    expect(captured().isError).toBe(true);
    expect(captured().error?.code).toBe('QUOTA_EXCEEDED');

    renderer.unmount();
  });
});
