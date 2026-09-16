import { expenseRepository } from '@data/expenses/repositories/ExpenseRepositoryImpl';
import type {
  CreateExpenseInput,
  CreatePaymentInput,
  Expense,
  Payment,
  UpdateExpenseInput,
} from '@domain/expenses/entities/Expense';
import type { ExpenseResult } from '@domain/expenses/repositories/ExpenseRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseQueryKey, expenseSummaryQueryKey, expensesQueryKey } from './useExpenses';

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para gestionar gastos', 400);

/** Invalidate every expenses-related query for the active household. */
const useInvalidateExpenses = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  return () => {
    void queryClient.invalidateQueries({ queryKey: expensesQueryKey(householdId) });
    void queryClient.invalidateQueries({ queryKey: expenseSummaryQueryKey(householdId) });
  };
};

const unwrap = <T>(result: ExpenseResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

export const useCreateExpense = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateExpenses();

  return useMutation<Expense, AppError, CreateExpenseInput>({
    mutationFn: async (input) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await expenseRepository.createExpense(householdId, input));
    },
    onSuccess: invalidate,
  });
};

export const useUpdateExpense = (expenseId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateExpenses();
  const queryClient = useQueryClient();

  return useMutation<Expense, AppError, UpdateExpenseInput>({
    mutationFn: async (input) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await expenseRepository.updateExpense(householdId, expenseId, input));
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: expenseQueryKey(householdId, expenseId) });
    },
  });
};

export const useDeleteExpense = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateExpenses();

  return useMutation<void, AppError, string>({
    mutationFn: async (expenseId) => {
      if (householdId === null) throw noHousehold();
      const result = await expenseRepository.deleteExpense(householdId, expenseId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: invalidate,
  });
};

export const useCreatePayment = (expenseId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateExpenses();
  const queryClient = useQueryClient();

  return useMutation<Payment, AppError, CreatePaymentInput>({
    mutationFn: async (input) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await expenseRepository.createPayment(householdId, expenseId, input));
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: expenseQueryKey(householdId, expenseId) });
    },
  });
};

export const useConfirmPayment = (expenseId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateExpenses();
  const queryClient = useQueryClient();

  return useMutation<Payment, AppError, string>({
    mutationFn: async (paymentId) => {
      if (householdId === null) throw noHousehold();
      return unwrap(await expenseRepository.confirmPayment(householdId, expenseId, paymentId));
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: expenseQueryKey(householdId, expenseId) });
    },
  });
};

export const useReversePayment = (expenseId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateExpenses();
  const queryClient = useQueryClient();

  return useMutation<Payment, AppError, { paymentId: string; reversalReason?: string }>({
    mutationFn: async ({ paymentId, reversalReason }) => {
      if (householdId === null) throw noHousehold();
      return unwrap(
        await expenseRepository.reversePayment(householdId, expenseId, paymentId, {
          ...(reversalReason !== undefined && { reversalReason }),
        }),
      );
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: expenseQueryKey(householdId, expenseId) });
    },
  });
};
