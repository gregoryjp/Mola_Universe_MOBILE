// Mirrors the backend expenses contracts (modules/expenses/interface/IExpense.ts).

export type ExpenseStatus = 'PENDING' | 'SETTLED';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REVERSED';

export interface ExpenseSplit {
  id: string;
  userId: string;
  amount: string;
  /** Calculated: this user owes this amount to the payer. */
  owedBy: string;
}

export interface Expense {
  id: string;
  householdId: string;
  description: string;
  /** Decimal as string (backend keeps precision as string). */
  amount: string;
  currency: string;
  paidBy: string;
  createdBy: string;
  category: string | null;
  receiptReference: string | null;
  date: string;
  status: ExpenseStatus;
  totalPaid: string;
  remainingAmount: string;
  splits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  expenseId: string;
  /** Debtor. */
  paidByUserId: string;
  /** Creditor. */
  paidToUserId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  confirmedAt: string | null;
  reversedAt: string | null;
  reversalReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  fromUserId: string;
  toUserId: string;
  /** Positive means `fromUserId` owes `toUserId`. */
  amount: string;
  payments: Payment[];
}

export interface ExpenseSummary {
  householdId: string;
  currency: string;
  totalExpenses: string;
  totalPaid: string;
  balances: Balance[];
}

export interface CreateExpenseSplitInput {
  userId: string;
  amount: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: string;
  paidBy: string;
  category?: string;
  receiptReference?: string;
  date?: string;
  /** If provided, splits are explicit; otherwise the backend splits equally. */
  splits?: CreateExpenseSplitInput[];
}

export interface UpdateExpenseInput {
  description?: string;
  category?: string;
  receiptReference?: string;
}

export interface CreatePaymentInput {
  paidByUserId: string;
  paidToUserId: string;
  amount: string;
}

export interface ReversePaymentInput {
  reversalReason?: string;
  idempotencyKey?: string;
}
