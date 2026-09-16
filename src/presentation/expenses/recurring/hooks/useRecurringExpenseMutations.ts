import { recurringExpenseRepository } from '@data/expenses/recurring/repositories/RecurringExpenseRepositoryImpl';
import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  RestockRecurringExpenseInput,
} from '@domain/expenses/recurring/entities/RecurringExpense';
import type { ExpenseResult } from '@domain/expenses/repositories/ExpenseRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringExpensesQueryKey } from './useRecurringExpenses';

const unwrap = <T>(result: ExpenseResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

const requireHousehold = (householdId: string | null): string => {
  if (householdId === null) {
    throw new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para gestionar los recurrentes', 400);
  }
  return householdId;
};

export const useCreateRecurringExpense = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useMutation<RecurringExpense, AppError, CreateRecurringExpenseInput>({
    mutationFn: async (input) =>
      unwrap(await recurringExpenseRepository.create(requireHousehold(householdId), input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recurringExpensesQueryKey(householdId) });
    },
  });
};

export const useRestockRecurringExpense = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useMutation<
    RecurringExpense,
    AppError,
    { recurringId: string; input: RestockRecurringExpenseInput }
  >({
    mutationFn: async ({ recurringId, input }) =>
      unwrap(
        await recurringExpenseRepository.restock(requireHousehold(householdId), recurringId, input),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recurringExpensesQueryKey(householdId) });
    },
  });
};

export const useArchiveRecurringExpense = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useMutation<void, AppError, string>({
    mutationFn: async (recurringId) => {
      const result = await recurringExpenseRepository.archive(
        requireHousehold(householdId),
        recurringId,
      );
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recurringExpensesQueryKey(householdId) });
    },
  });
};
