import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  RestockRecurringExpenseInput,
} from '@domain/expenses/recurring/entities/RecurringExpense';
import type { RecurringExpenseRepository } from '@domain/expenses/recurring/repositories/RecurringExpenseRepository';
import type { ExpenseResult } from '@domain/expenses/repositories/ExpenseRepository';
import type {
  CreateRecurringExpenseRequestDto,
  RecurringExpenseDto,
  RestockRecurringExpenseRequestDto,
} from '../dtos/recurringExpenseDtos';
import {
  toCreateRecurringExpenseRequest,
  toRecurringExpense,
  toRestockRecurringExpenseRequest,
} from '../mappers/recurringExpenseMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): ExpenseResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const basePath = (householdId: string): string => `/households/${householdId}/recurring-expenses`;

export class RecurringExpenseRepositoryImpl implements RecurringExpenseRepository {
  async list(householdId: string): Promise<ExpenseResult<RecurringExpense[]>> {
    const raw = await apiClient.getRaw<RecurringExpenseDto[]>(basePath(householdId));
    return raw.success
      ? { success: true, value: raw.data.map(toRecurringExpense) }
      : { success: false, error: toError(raw) };
  }

  async create(
    householdId: string,
    input: CreateRecurringExpenseInput,
  ): Promise<ExpenseResult<RecurringExpense>> {
    const body: CreateRecurringExpenseRequestDto = toCreateRecurringExpenseRequest(input);
    const raw = await apiClient.postRaw<RecurringExpenseDto>(basePath(householdId), body);
    return toResult(raw, toRecurringExpense);
  }

  async restock(
    householdId: string,
    recurringId: string,
    input: RestockRecurringExpenseInput,
  ): Promise<ExpenseResult<RecurringExpense>> {
    const body: RestockRecurringExpenseRequestDto = toRestockRecurringExpenseRequest(input);
    const raw = await apiClient.postRaw<RecurringExpenseDto>(
      `${basePath(householdId)}/${recurringId}/restock`,
      body,
    );
    return toResult(raw, toRecurringExpense);
  }

  async archive(householdId: string, recurringId: string): Promise<ExpenseResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`${basePath(householdId)}/${recurringId}`);
    return raw.success
      ? { success: true, value: undefined }
      : { success: false, error: toError(raw) };
  }
}

export const recurringExpenseRepository: RecurringExpenseRepository =
  new RecurringExpenseRepositoryImpl();
