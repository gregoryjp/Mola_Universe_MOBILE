import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreateExpenseInput,
  CreatePaymentInput,
  Expense,
  ExpenseSummary,
  Payment,
  ReversePaymentInput,
  UpdateExpenseInput,
} from '@domain/expenses/entities/Expense';
import type {
  ExpenseRepository,
  ExpenseResult,
  PageParams,
  PaginatedExpenses,
} from '@domain/expenses/repositories/ExpenseRepository';
import type {
  CreatePaymentRequestDto,
  ExpenseDto,
  ExpenseSummaryDto,
  PaginatedExpensesDto,
  PaymentDto,
  ReversePaymentRequestDto,
  UpdateExpenseRequestDto,
} from '../dtos/expenseDtos';
import {
  toCreateExpenseRequest,
  toExpense,
  toExpenseSummary,
  toPaginatedExpenses,
  toPayment,
} from '../mappers/expenseMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): ExpenseResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const queryString = (params?: PageParams): string => {
  if (!params) return '';
  const parts: string[] = [];
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

const emptyOk = (): ExpenseResult<void> => ({ success: true, value: undefined });

export class ExpenseRepositoryImpl implements ExpenseRepository {
  async listExpenses(
    householdId: string,
    params?: PageParams,
  ): Promise<ExpenseResult<PaginatedExpenses>> {
    const raw = await apiClient.getRaw<PaginatedExpensesDto>(
      `/households/${householdId}/expenses${queryString(params)}`,
    );
    return toResult(raw, toPaginatedExpenses);
  }

  async getExpense(householdId: string, expenseId: string): Promise<ExpenseResult<Expense>> {
    const raw = await apiClient.getRaw<ExpenseDto>(
      `/households/${householdId}/expenses/${expenseId}`,
    );
    return toResult(raw, toExpense);
  }

  async createExpense(
    householdId: string,
    input: CreateExpenseInput,
  ): Promise<ExpenseResult<Expense>> {
    const body = toCreateExpenseRequest(input);
    const raw = await apiClient.postRaw<ExpenseDto>(`/households/${householdId}/expenses`, body);
    return toResult(raw, toExpense);
  }

  async updateExpense(
    householdId: string,
    expenseId: string,
    input: UpdateExpenseInput,
  ): Promise<ExpenseResult<Expense>> {
    const body: UpdateExpenseRequestDto = { ...input };
    const raw = await apiClient.patchRaw<ExpenseDto>(
      `/households/${householdId}/expenses/${expenseId}`,
      body,
    );
    return toResult(raw, toExpense);
  }

  async deleteExpense(householdId: string, expenseId: string): Promise<ExpenseResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/households/${householdId}/expenses/${expenseId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }

  async getSummary(householdId: string): Promise<ExpenseResult<ExpenseSummary>> {
    const raw = await apiClient.getRaw<ExpenseSummaryDto>(
      `/households/${householdId}/expenses/summary`,
    );
    return toResult(raw, toExpenseSummary);
  }

  async createPayment(
    householdId: string,
    expenseId: string,
    input: CreatePaymentInput,
  ): Promise<ExpenseResult<Payment>> {
    const body: CreatePaymentRequestDto = { ...input };
    const raw = await apiClient.postRaw<PaymentDto>(
      `/households/${householdId}/expenses/${expenseId}/payments`,
      body,
    );
    return toResult(raw, toPayment);
  }

  async confirmPayment(
    householdId: string,
    expenseId: string,
    paymentId: string,
    idempotencyKey?: string,
  ): Promise<ExpenseResult<Payment>> {
    const body = idempotencyKey !== undefined ? { idempotencyKey } : {};
    const raw = await apiClient.postRaw<PaymentDto>(
      `/households/${householdId}/expenses/${expenseId}/payments/${paymentId}/confirm`,
      body,
    );
    return toResult(raw, toPayment);
  }

  async reversePayment(
    householdId: string,
    expenseId: string,
    paymentId: string,
    input?: ReversePaymentInput,
  ): Promise<ExpenseResult<Payment>> {
    const body: ReversePaymentRequestDto = { ...input };
    const raw = await apiClient.postRaw<PaymentDto>(
      `/households/${householdId}/expenses/${expenseId}/payments/${paymentId}/reverse`,
      body,
    );
    return toResult(raw, toPayment);
  }
}

export const expenseRepository: ExpenseRepository = new ExpenseRepositoryImpl();
