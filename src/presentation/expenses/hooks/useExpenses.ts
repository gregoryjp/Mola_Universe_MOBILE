import { expenseRepository } from '@data/expenses/repositories/ExpenseRepositoryImpl';
import type { Expense, ExpenseSummary } from '@domain/expenses/entities/Expense';
import type { PaginatedExpenses } from '@domain/expenses/repositories/ExpenseRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const expensesQueryKey = (householdId: string | null) =>
  ['expenses', 'list', householdId] as const;
export const expenseSummaryQueryKey = (householdId: string | null) =>
  ['expenses', 'summary', householdId] as const;
export const expenseQueryKey = (householdId: string | null, expenseId: string) =>
  ['expenses', 'detail', householdId, expenseId] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver los gastos', 400);

export const useExpenses = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<PaginatedExpenses, AppError>({
    queryKey: expensesQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await expenseRepository.listExpenses(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};

export const useExpenseSummary = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<ExpenseSummary, AppError>({
    queryKey: expenseSummaryQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await expenseRepository.getSummary(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};

export const useExpense = (expenseId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<Expense, AppError>({
    queryKey: expenseQueryKey(householdId, expenseId),
    enabled: householdId !== null && expenseId.length > 0,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await expenseRepository.getExpense(householdId, expenseId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};
