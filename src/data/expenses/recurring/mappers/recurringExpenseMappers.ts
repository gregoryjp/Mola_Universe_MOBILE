import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  RestockRecurringExpenseInput,
} from '@domain/expenses/recurring/entities/RecurringExpense';
import type {
  CreateRecurringExpenseRequestDto,
  RecurringExpenseDto,
  RestockRecurringExpenseRequestDto,
} from '../dtos/recurringExpenseDtos';

export const toRecurringExpense = (dto: RecurringExpenseDto): RecurringExpense => ({
  id: dto.id,
  householdId: dto.householdId,
  name: dto.name,
  category: dto.category ?? null,
  currency: dto.currency,
  lastPurchasedBy: dto.lastPurchasedBy ?? null,
  lastPurchasedAt: dto.lastPurchasedAt ?? null,
  currentTurnUserId: dto.currentTurnUserId,
  createdAt: dto.createdAt,
});

export const toCreateRecurringExpenseRequest = (
  input: CreateRecurringExpenseInput,
): CreateRecurringExpenseRequestDto => ({
  name: input.name,
  ...(input.category !== undefined && { category: input.category }),
  ...(input.currency !== undefined && { currency: input.currency }),
});

export const toRestockRecurringExpenseRequest = (
  input: RestockRecurringExpenseInput,
): RestockRecurringExpenseRequestDto => ({ amount: input.amount });
