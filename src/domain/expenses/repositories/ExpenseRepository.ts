import type {
  CreateExpenseInput,
  CreatePaymentInput,
  Expense,
  ExpenseSummary,
  Payment,
  ReversePaymentInput,
  UpdateExpenseInput,
} from '../entities/Expense';

export interface ExpenseError {
  code: string;
  message: string;
  statusCode: number;
}

export type ExpenseResult<T> =
  | { success: true; value: T }
  | { success: false; error: ExpenseError };

export interface PageParams {
  page?: number;
  limit?: number;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Expenses port. Every route is household-scoped: the expense belongs to a
 * `householdId` and membership is validated on each call (ADR-0008).
 * Verified in modules/expenses/routes/expenseRoutes.ts.
 */
export interface ExpenseRepository {
  listExpenses(householdId: string, params?: PageParams): Promise<ExpenseResult<PaginatedExpenses>>;
  getExpense(householdId: string, expenseId: string): Promise<ExpenseResult<Expense>>;
  createExpense(householdId: string, input: CreateExpenseInput): Promise<ExpenseResult<Expense>>;
  updateExpense(
    householdId: string,
    expenseId: string,
    input: UpdateExpenseInput,
  ): Promise<ExpenseResult<Expense>>;
  deleteExpense(householdId: string, expenseId: string): Promise<ExpenseResult<void>>;
  getSummary(householdId: string): Promise<ExpenseResult<ExpenseSummary>>;
  createPayment(
    householdId: string,
    expenseId: string,
    input: CreatePaymentInput,
  ): Promise<ExpenseResult<Payment>>;
  confirmPayment(
    householdId: string,
    expenseId: string,
    paymentId: string,
    idempotencyKey?: string,
  ): Promise<ExpenseResult<Payment>>;
  reversePayment(
    householdId: string,
    expenseId: string,
    paymentId: string,
    input?: ReversePaymentInput,
  ): Promise<ExpenseResult<Payment>>;
}
