// Mirrors modules/expenses/interface/IExpense.ts (IRecurringExpenseDTO).

export interface RecurringExpenseDto {
  id: string;
  householdId: string;
  name: string;
  category?: string | null;
  currency: string;
  lastPurchasedBy?: string | null;
  lastPurchasedAt?: string | null;
  currentTurnUserId: string | null;
  createdAt: string;
}

/** `CreateRecurringExpenseSchema`: `{ name, category?, currency? }`. */
export interface CreateRecurringExpenseRequestDto {
  name: string;
  category?: string;
  currency?: string;
}

/** `RestockRecurringExpenseSchema`: `{ amount }` (decimal string). */
export interface RestockRecurringExpenseRequestDto {
  amount: string;
}
