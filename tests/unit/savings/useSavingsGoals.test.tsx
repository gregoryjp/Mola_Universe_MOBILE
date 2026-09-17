import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  listHouseholdGoals: vi.fn(),
  listPersonalGoals: vi.fn(),
  listCells: vi.fn(),
}));

vi.mock('@data/savings/repositories/SavingsRepositoryImpl', () => ({
  savingsRepository: {
    listHouseholdGoals: mocks.listHouseholdGoals,
    listPersonalGoals: mocks.listPersonalGoals,
    listCells: mocks.listCells,
  },
}));

import type { SavingsGoal } from '@domain/savings/entities/SavingsGoal';
import type { PaginatedSavingsGoals } from '@domain/savings/repositories/SavingsRepository';
import {
  useHouseholdSavingsGoals,
  usePersonalSavingsGoals,
  useSavingsCells,
} from '@presentation/savings/hooks/useSavingsGoals';
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

const page: PaginatedSavingsGoals = { goals: [goal], total: 1, page: 1, limit: 20 };

const withQueryClient = async (node: React.ReactElement): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
  });
  await act(async () => {
    await flushQueries();
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('savings query hooks', () => {
  it('loads household goals when a household is active', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listHouseholdGoals.mockResolvedValueOnce({ success: true, value: page });

    let captured: ReturnType<typeof useHouseholdSavingsGoals> | undefined;
    const Harness = (): null => {
      captured = useHouseholdSavingsGoals();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listHouseholdGoals).toHaveBeenCalledWith('h1', { page: 1 });
    expect(captured?.goals).toHaveLength(1);

    renderer.unmount();
  });

  it('stays idle (no request) when no household is active', async () => {
    let captured: ReturnType<typeof useHouseholdSavingsGoals> | undefined;
    const Harness = (): null => {
      captured = useHouseholdSavingsGoals();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listHouseholdGoals).not.toHaveBeenCalled();
    expect(captured?.fetchStatus).toBe('idle');

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listHouseholdGoals.mockResolvedValueOnce({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not a member', statusCode: 403 },
    });

    let captured: ReturnType<typeof useHouseholdSavingsGoals> | undefined;
    const Harness = (): null => {
      captured = useHouseholdSavingsGoals();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('UNAUTHORIZED');

    renderer.unmount();
  });

  it('loads personal goals without a household', async () => {
    mocks.listPersonalGoals.mockResolvedValueOnce({ success: true, value: page });

    let captured: ReturnType<typeof usePersonalSavingsGoals> | undefined;
    const Harness = (): null => {
      captured = usePersonalSavingsGoals();
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listPersonalGoals).toHaveBeenCalled();
    expect(captured?.goals).toHaveLength(1);

    renderer.unmount();
  });

  it('loads the goal cells', async () => {
    mocks.listCells.mockResolvedValueOnce({
      success: true,
      value: [
        {
          id: 'c1',
          goalId: 'g1',
          denomination: '50.00',
          position: 1,
          isMarked: false,
          markedBy: null,
          markedAt: null,
          createdAt: '2026-09-15T00:00:00.000Z',
          updatedAt: '2026-09-15T00:00:00.000Z',
        },
      ],
    });

    let captured: ReturnType<typeof useSavingsCells> | undefined;
    const Harness = (): null => {
      captured = useSavingsCells('g1');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.listCells).toHaveBeenCalledWith('g1');
    expect(captured?.data).toHaveLength(1);

    renderer.unmount();
  });
});
