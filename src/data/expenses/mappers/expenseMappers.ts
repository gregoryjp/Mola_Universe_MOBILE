import type {
  Balance,
  CreateExpenseInput,
  Expense,
  ExpenseSplit,
  ExpenseStatus,
  ExpenseSummary,
  Payment,
  PaymentStatus,
} from '@domain/expenses/entities/Expense';
import type { PaginatedExpenses } from '@domain/expenses/repositories/ExpenseRepository';
import type {
  BalanceDto,
  CreateExpenseRequestDto,
  ExpenseDto,
  ExpenseSplitDto,
  ExpenseSummaryDto,
  PaginatedExpensesDto,
  PaymentDto,
} from '../dtos/expenseDtos';

export const toExpenseSplit = (dto: ExpenseSplitDto): ExpenseSplit => ({
  id: dto.id,
  userId: dto.userId,
  amount: dto.amount,
  owedBy: dto.owedBy,
});

export const toExpense = (dto: ExpenseDto): Expense => ({
  id: dto.id,
  householdId: dto.householdId,
  description: dto.description,
  amount: dto.amount,
  currency: dto.currency,
  paidBy: dto.paidBy,
  createdBy: dto.createdBy,
  category: dto.category ?? null,
  receiptReference: dto.receiptReference ?? null,
  date: dto.date,
  status: dto.status as ExpenseStatus,
  totalPaid: dto.totalPaid,
  remainingAmount: dto.remainingAmount,
  splits: dto.splits.map(toExpenseSplit),
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toPayment = (dto: PaymentDto): Payment => ({
  id: dto.id,
  expenseId: dto.expenseId,
  paidByUserId: dto.paidByUserId,
  paidToUserId: dto.paidToUserId,
  amount: dto.amount,
  currency: dto.currency,
  status: dto.status as PaymentStatus,
  confirmedAt: dto.confirmedAt ?? null,
  reversedAt: dto.reversedAt ?? null,
  reversalReason: dto.reversalReason ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toBalance = (dto: BalanceDto): Balance => ({
  fromUserId: dto.fromUserId,
  toUserId: dto.toUserId,
  amount: dto.amount,
  payments: dto.payments.map(toPayment),
});

export const toExpenseSummary = (dto: ExpenseSummaryDto): ExpenseSummary => ({
  householdId: dto.householdId,
  currency: dto.currency,
  totalExpenses: dto.totalExpenses,
  totalPaid: dto.totalPaid,
  balances: dto.balances.map(toBalance),
});

export const toPaginatedExpenses = (dto: PaginatedExpensesDto): PaginatedExpenses => ({
  expenses: dto.expenses.map(toExpense),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
});

export const toCreateExpenseRequest = (input: CreateExpenseInput): CreateExpenseRequestDto => ({
  description: input.description,
  amount: input.amount,
  paidBy: input.paidBy,
  ...(input.category !== undefined && { category: input.category }),
  ...(input.receiptReference !== undefined && { receiptReference: input.receiptReference }),
  ...(input.date !== undefined && { date: input.date }),
  ...(input.splits !== undefined && {
    splits: input.splits.map((split) => ({ userId: split.userId, amount: split.amount })),
  }),
});
