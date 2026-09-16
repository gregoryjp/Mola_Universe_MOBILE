import { toTask } from '@data/tasks/mappers/taskMappers';
import type {
  CalendarEventType,
  DashboardEvent,
  DashboardExpense,
  DashboardShoppingList,
  DashboardSummary,
} from '@domain/dashboard/entities/DashboardSummary';
import type {
  DashboardEventDto,
  DashboardExpenseDto,
  DashboardShoppingListDto,
  DashboardSummaryDto,
} from '../dtos/dashboardDtos';

const toEvent = (dto: DashboardEventDto): DashboardEvent => ({
  id: dto.id,
  title: dto.title,
  type: dto.type as CalendarEventType,
  startAt: dto.startAt,
  endAt: dto.endAt ?? null,
});

const toShoppingList = (dto: DashboardShoppingListDto): DashboardShoppingList => ({
  id: dto.id,
  name: dto.name,
  status: dto.status === 'COMPLETED' ? 'COMPLETED' : 'OPEN',
});

const toExpense = (dto: DashboardExpenseDto): DashboardExpense => ({
  id: dto.id,
  description: dto.description,
  amount: dto.amount,
  currency: dto.currency,
  date: dto.date,
});

export const toDashboardSummary = (dto: DashboardSummaryDto): DashboardSummary => ({
  householdId: dto.householdId,
  date: dto.date,
  tasksToday: dto.tasksToday.map(toTask),
  eventsToday: dto.eventsToday.map(toEvent),
  openShoppingLists: dto.openShoppingLists.map(toShoppingList),
  recentExpenses: dto.recentExpenses.map(toExpense),
  meowSummary: dto.meowSummary,
});
