import { savingsRepository } from '@data/savings/repositories/SavingsRepositoryImpl';
import type {
  SavingsCell,
  SavingsContribution,
  SavingsGoal,
  SavingsMovement,
} from '@domain/savings/entities/SavingsGoal';
import type { PaginatedSavingsGoals } from '@domain/savings/repositories/SavingsRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const savingsGoalsQueryKey = (householdId: string | null) =>
  ['savings', 'goals', householdId] as const;
export const personalSavingsGoalsQueryKey = () => ['savings', 'goals', 'personal'] as const;
export const savingsGoalQueryKey = (goalId: string) => ['savings', 'goal', goalId] as const;
export const savingsCellsQueryKey = (goalId: string) => ['savings', 'cells', goalId] as const;
export const savingsMovementsQueryKey = (goalId: string) =>
  ['savings', 'movements', goalId] as const;
export const savingsContributionsQueryKey = (goalId: string) =>
  ['savings', 'contributions', goalId] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver sus ahorros', 400);

function fail(error: { code: string; message: string; statusCode: number }): never {
  throw new AppError(error.code, error.message, error.statusCode);
}

export const useHouseholdSavingsGoals = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  const query = useInfiniteQuery<PaginatedSavingsGoals, AppError>({
    queryKey: savingsGoalsQueryKey(householdId),
    enabled: householdId !== null,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (householdId === null) throw noHousehold();
      const result = await savingsRepository.listHouseholdGoals(householdId, {
        page: pageParam as number,
      });
      if (!result.success) fail(result.error);
      return result.value;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });

  const goals: SavingsGoal[] = query.data?.pages.flatMap((page) => page.goals) ?? [];

  return { ...query, goals };
};

export const usePersonalSavingsGoals = () => {
  const query = useInfiniteQuery<PaginatedSavingsGoals, AppError>({
    queryKey: personalSavingsGoalsQueryKey(),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await savingsRepository.listPersonalGoals({ page: pageParam as number });
      if (!result.success) fail(result.error);
      return result.value;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });

  const goals: SavingsGoal[] = query.data?.pages.flatMap((page) => page.goals) ?? [];

  return { ...query, goals };
};

export const useSavingsGoal = (goalId: string) =>
  useQuery<SavingsGoal, AppError>({
    queryKey: savingsGoalQueryKey(goalId),
    enabled: goalId.length > 0,
    queryFn: async () => {
      const result = await savingsRepository.getGoal(goalId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

export const useSavingsCells = (goalId: string) =>
  useQuery<SavingsCell[], AppError>({
    queryKey: savingsCellsQueryKey(goalId),
    enabled: goalId.length > 0,
    queryFn: async () => {
      const result = await savingsRepository.listCells(goalId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

export const useSavingsMovements = (goalId: string) =>
  useQuery<SavingsMovement[], AppError>({
    queryKey: savingsMovementsQueryKey(goalId),
    enabled: goalId.length > 0,
    queryFn: async () => {
      const result = await savingsRepository.listMovements(goalId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });

export const useSavingsContributions = (goalId: string) =>
  useQuery<SavingsContribution[], AppError>({
    queryKey: savingsContributionsQueryKey(goalId),
    enabled: goalId.length > 0,
    queryFn: async () => {
      const result = await savingsRepository.listContributions(goalId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
