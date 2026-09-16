// Mirrors the backend contract (modules/expenses/interface/IExpense.ts,
// IRecurringExpenseDTO) for rotating common expenses — ADR-0021.

export interface RecurringExpense {
  id: string;
  householdId: string;
  name: string;
  category: string | null;
  currency: string;
  /** Member who did the last restock; drives the round-robin turn. */
  lastPurchasedBy: string | null;
  lastPurchasedAt: string | null;
  /**
   * Whose turn it is. Recomputed by the backend from the active-member order
   * on every read, never persisted, so it self-heals on membership changes.
   */
  currentTurnUserId: string | null;
  createdAt: string;
}

export interface CreateRecurringExpenseInput {
  name: string;
  category?: string;
  currency?: string;
}

/** `amount` follows the expense-amount convention: decimal string, e.g. "12.50". */
export interface RestockRecurringExpenseInput {
  amount: string;
}
