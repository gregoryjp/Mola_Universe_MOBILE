import { recurringExpenseRepository } from '@data/expenses/recurring/repositories/RecurringExpenseRepositoryImpl';
import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const recurringExpensesQueryKey = (householdId: string | null) =>
  ['expenses', 'recurring', householdId] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver los gastos recurrentes', 400);

export const useRecurringExpenses = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<RecurringExpense[], AppError>({
    queryKey: recurringExpensesQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await recurringExpenseRepository.list(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};
