import { apiClient } from './client';
import { ExpenseEntity } from '../types/entities';

export interface CreateExpensePayload {
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  category?: string;
  receiptReference?: string;
  date: string;
}

export interface CreateExpenseWithSplitsPayload extends CreateExpensePayload {
  splits: Array<{
    userId: string;
    amount: string;
  }>;
}

export async function getHouseholdExpenses(householdId: string): Promise<ExpenseEntity[]> {
  const { data } = await apiClient.get<ExpenseEntity[]>(
    `/households/${householdId}/expenses`
  );
  return data;
}

export async function getExpense(expenseId: string): Promise<ExpenseEntity> {
  const { data } = await apiClient.get<ExpenseEntity>(`/expenses/${expenseId}`);
  return data;
}

export async function createExpense(
  householdId: string,
  payload: CreateExpenseWithSplitsPayload
): Promise<ExpenseEntity> {
  const { data } = await apiClient.post<ExpenseEntity>(
    `/households/${householdId}/expenses`,
    payload
  );
  return data;
}

export async function settleExpense(expenseId: string): Promise<ExpenseEntity> {
  const { data } = await apiClient.post<ExpenseEntity>(`/expenses/${expenseId}/settle`);
  return data;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await apiClient.delete(`/expenses/${expenseId}`);
}
