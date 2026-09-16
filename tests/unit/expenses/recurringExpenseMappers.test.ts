import {
  toCreateRecurringExpenseRequest,
  toRecurringExpense,
  toRestockRecurringExpenseRequest,
} from '@data/expenses/recurring/mappers/recurringExpenseMappers';
import { describe, expect, it } from 'vitest';

describe('recurring expense mappers', () => {
  it('maps the dto defaulting the nullable fields', () => {
    expect(
      toRecurringExpense({
        id: 'r1',
        householdId: 'h1',
        name: 'Detergente',
        currency: 'EUR',
        currentTurnUserId: null,
        createdAt: '2026-09-17T09:00:00.000Z',
      }),
    ).toEqual({
      id: 'r1',
      householdId: 'h1',
      name: 'Detergente',
      category: null,
      currency: 'EUR',
      lastPurchasedBy: null,
      lastPurchasedAt: null,
      currentTurnUserId: null,
      createdAt: '2026-09-17T09:00:00.000Z',
    });
  });

  it('keeps the turn and the last purchase when present', () => {
    const expense = toRecurringExpense({
      id: 'r1',
      householdId: 'h1',
      name: 'Detergente',
      category: 'Limpieza',
      currency: 'EUR',
      lastPurchasedBy: 'u2',
      lastPurchasedAt: '2026-09-16T09:00:00.000Z',
      currentTurnUserId: 'u1',
      createdAt: '2026-09-17T09:00:00.000Z',
    });

    expect(expense.currentTurnUserId).toBe('u1');
    expect(expense.lastPurchasedBy).toBe('u2');
    expect(expense.category).toBe('Limpieza');
  });

  it('omits category and currency when they are not provided', () => {
    expect(toCreateRecurringExpenseRequest({ name: 'Detergente' })).toEqual({
      name: 'Detergente',
    });
    expect(
      toCreateRecurringExpenseRequest({ name: 'Detergente', category: 'Limpieza', currency: 'EUR' }),
    ).toEqual({ name: 'Detergente', category: 'Limpieza', currency: 'EUR' });
  });

  it('wraps the amount as a decimal string on restock', () => {
    expect(toRestockRecurringExpenseRequest({ amount: '12.50' })).toEqual({ amount: '12.50' });
  });
});
