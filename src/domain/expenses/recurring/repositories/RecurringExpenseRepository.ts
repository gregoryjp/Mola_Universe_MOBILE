import type { ExpenseResult } from '../../repositories/ExpenseRepository';
import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  RestockRecurringExpenseInput,
} from '../entities/RecurringExpense';

/**
 * Recurring (rotating) common expenses port — ADR-0021. Every route is
 * household-scoped. Verified in modules/expenses/routes/expenseRoutes.ts:
 *   POST   /households/:householdId/recurring-expenses            → 201
 *   GET    /households/:householdId/recurring-expenses            → 200 (flat array)
 *   POST   /households/:householdId/recurring-expenses/:id/restock → 200
 *   DELETE /households/:householdId/recurring-expenses/:id         → 204
 * There is no update/patch route: renaming is not supported by the backend.
 */
export interface RecurringExpenseRepository {
  list(householdId: string): Promise<ExpenseResult<RecurringExpense[]>>;
  create(
    householdId: string,
    input: CreateRecurringExpenseInput,
  ): Promise<ExpenseResult<RecurringExpense>>;
  restock(
    householdId: string,
    recurringId: string,
    input: RestockRecurringExpenseInput,
  ): Promise<ExpenseResult<RecurringExpense>>;
  archive(householdId: string, recurringId: string): Promise<ExpenseResult<void>>;
}
