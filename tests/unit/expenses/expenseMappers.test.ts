import { describe, expect, it } from 'vitest';
import {
  toBalance,
  toCreateExpenseRequest,
  toExpense,
  toExpenseSummary,
  toPaginatedExpenses,
  toPayment,
} from '@data/expenses/mappers/expenseMappers';

const expenseDto = {
  id: 'e1',
  householdId: 'h1',
  description: 'Supermercado',
  amount: '42.50',
  currency: 'EUR',
  paidBy: 'u1',
  createdBy: 'u1',
  date: '2026-09-15T00:00:00.000Z',
  status: 'PENDING',
  totalPaid: '0.00',
  remainingAmount: '42.50',
  splits: [{ id: 's1', userId: 'u2', amount: '21.25', owedBy: 'u2' }],
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const paymentDto = {
  id: 'p1',
  expenseId: 'e1',
  paidByUserId: 'u2',
  paidToUserId: 'u1',
  amount: '21.25',
  currency: 'EUR',
  status: 'PENDING',
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

describe('expenseMappers', () => {
  it('normalises optional Expense fields to null and maps splits', () => {
    const expense = toExpense(expenseDto);

    expect(expense.category).toBeNull();
    expect(expense.receiptReference).toBeNull();
    expect(expense.status).toBe('PENDING');
    expect(expense.splits).toHaveLength(1);
    expect(expense.splits[0]?.owedBy).toBe('u2');
  });

  it('normalises optional Payment fields to null', () => {
    const payment = toPayment(paymentDto);

    expect(payment.confirmedAt).toBeNull();
    expect(payment.reversedAt).toBeNull();
    expect(payment.reversalReason).toBeNull();
    expect(payment.status).toBe('PENDING');
  });

  it('maps balances with their payments', () => {
    const balance = toBalance({
      fromUserId: 'u2',
      toUserId: 'u1',
      amount: '21.25',
      payments: [paymentDto],
    });

    expect(balance.amount).toBe('21.25');
    expect(balance.payments).toHaveLength(1);
    expect(balance.payments[0]?.id).toBe('p1');
  });

  it('maps the summary envelope', () => {
    const summary = toExpenseSummary({
      householdId: 'h1',
      currency: 'EUR',
      totalExpenses: '42.50',
      totalPaid: '0.00',
      balances: [{ fromUserId: 'u2', toUserId: 'u1', amount: '21.25', payments: [] }],
    });

    expect(summary.currency).toBe('EUR');
    expect(summary.totalExpenses).toBe('42.50');
    expect(summary.balances).toHaveLength(1);
  });

  it('maps the paginated expenses envelope', () => {
    const page = toPaginatedExpenses({
      expenses: [expenseDto],
      total: 1,
      page: 1,
      limit: 20,
    });

    expect(page.expenses).toHaveLength(1);
    expect(page.total).toBe(1);
  });

  it('builds a create request omitting absent optional fields', () => {
    const body = toCreateExpenseRequest({ description: 'Cena', amount: '30.00', paidBy: 'u1' });

    expect(body).toEqual({ description: 'Cena', amount: '30.00', paidBy: 'u1' });
  });

  it('includes category, receiptReference and splits when provided', () => {
    const body = toCreateExpenseRequest({
      description: 'Cena',
      amount: '30.00',
      paidBy: 'u1',
      category: 'COMIDA',
      receiptReference: 'ref-1',
      splits: [{ userId: 'u2', amount: '15.00' }],
    });

    expect(body).toEqual({
      description: 'Cena',
      amount: '30.00',
      paidBy: 'u1',
      category: 'COMIDA',
      receiptReference: 'ref-1',
      splits: [{ userId: 'u2', amount: '15.00' }],
    });
  });
});
