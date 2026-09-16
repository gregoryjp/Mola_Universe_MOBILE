// Mirrors the backend expenses payloads (modules/expenses/interface/IExpense.ts).

export interface ExpenseSplitDto {
  id: string;
  userId: string;
  amount: string;
  owedBy: string;
}

export interface ExpenseDto {
  id: string;
  householdId: string;
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  createdBy: string;
  category?: string | null;
  receiptReference?: string | null;
  date: string;
  status: string;
  totalPaid: string;
  remainingAmount: string;
  splits: ExpenseSplitDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDto {
  id: string;
  expenseId: string;
  paidByUserId: string;
  paidToUserId: string;
  amount: string;
  currency: string;
  status: string;
  confirmedAt?: string | null;
  reversedAt?: string | null;
  reversalReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceDto {
  fromUserId: string;
  toUserId: string;
  amount: string;
  payments: PaymentDto[];
}

export interface ExpenseSummaryDto {
  householdId: string;
  currency: string;
  totalExpenses: string;
  totalPaid: string;
  balances: BalanceDto[];
}

export interface PaginatedExpensesDto {
  expenses: ExpenseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateExpenseSplitRequestDto {
  userId: string;
  amount: string;
}

export interface CreateExpenseRequestDto {
  description: string;
  amount: string;
  paidBy: string;
  category?: string;
  receiptReference?: string;
  date?: string;
  splits?: CreateExpenseSplitRequestDto[];
}

export interface UpdateExpenseRequestDto {
  description?: string;
  category?: string;
  receiptReference?: string;
}

export interface CreatePaymentRequestDto {
  paidByUserId: string;
  paidToUserId: string;
  amount: string;
}

export interface ConfirmPaymentRequestDto {
  idempotencyKey?: string;
}

export interface ReversePaymentRequestDto {
  reversalReason?: string;
  idempotencyKey?: string;
}
