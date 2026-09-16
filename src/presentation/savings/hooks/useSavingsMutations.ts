import { savingsRepository } from '@data/savings/repositories/SavingsRepositoryImpl';
import type {
  CreateContributionInput,
  CreateSavingsGoalInput,
  MarkCellResult,
  SavingsGoal,
} from '@domain/savings/entities/SavingsGoal';
import type { SavingsResult } from '@domain/savings/repositories/SavingsRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  personalSavingsGoalsQueryKey,
  savingsCellsQueryKey,
  savingsContributionsQueryKey,
  savingsGoalQueryKey,
  savingsGoalsQueryKey,
  savingsMovementsQueryKey,
} from './useSavingsGoals';

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para gestionar sus ahorros', 400);

const unwrap = <T>(result: SavingsResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

const useInvalidateGoals = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  return () => {
    void queryClient.invalidateQueries({ queryKey: savingsGoalsQueryKey(householdId) });
    void queryClient.invalidateQueries({ queryKey: personalSavingsGoalsQueryKey() });
  };
};

export interface CreateSavingsGoalVariables {
  /** Household goals are created under the active household; otherwise personal. */
  scope: 'PERSONAL' | 'HOUSEHOLD';
  input: CreateSavingsGoalInput;
}

export const useCreateSavingsGoal = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateGoals();

  return useMutation<SavingsGoal, AppError, CreateSavingsGoalVariables>({
    mutationFn: async ({ scope, input }) => {
      if (scope === 'PERSONAL') {
        return unwrap(await savingsRepository.createPersonalGoal(input));
      }
      if (householdId === null) throw noHousehold();
      return unwrap(await savingsRepository.createHouseholdGoal(householdId, input));
    },
    onSuccess: invalidate,
  });
};

export const useDeleteSavingsGoal = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateGoals();

  return useMutation<void, AppError, string>({
    mutationFn: async (goalId) => {
      const result = await savingsRepository.deleteGoal(goalId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: (_void, goalId) => {
      invalidate();
      void queryClient.removeQueries({ queryKey: savingsGoalQueryKey(goalId) });
    },
  });
};

const useInvalidateBoard = (goalId: string) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateGoals();
  return () => {
    invalidate();
    void queryClient.invalidateQueries({ queryKey: savingsGoalQueryKey(goalId) });
    void queryClient.invalidateQueries({ queryKey: savingsCellsQueryKey(goalId) });
    void queryClient.invalidateQueries({ queryKey: savingsMovementsQueryKey(goalId) });
  };
};

export const useMarkCell = (goalId: string) => {
  const invalidate = useInvalidateBoard(goalId);
  return useMutation<MarkCellResult, AppError, string>({
    mutationFn: async (cellId) => unwrap(await savingsRepository.markCell(goalId, cellId)),
    onSuccess: invalidate,
  });
};

export const useUnmarkCell = (goalId: string) => {
  const invalidate = useInvalidateBoard(goalId);
  return useMutation<MarkCellResult, AppError, string>({
    mutationFn: async (cellId) => unwrap(await savingsRepository.unmarkCell(goalId, cellId)),
    onSuccess: invalidate,
  });
};

export const useCreateContribution = (goalId: string) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateBoard(goalId);

  return useMutation<unknown, AppError, CreateContributionInput>({
    mutationFn: async (input) => unwrap(await savingsRepository.createContribution(goalId, input)),
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: savingsContributionsQueryKey(goalId) });
    },
  });
};
