import type { TaskDto } from '@data/tasks/dtos/taskDtos';

// Mirrors the wire shape of GET /dashboard, but only the fields the read model
// consumes (Mola_Universe_APP/src/modules/dashboard/services/dashboardService.ts).

export interface DashboardEventDto {
  id: string;
  title: string;
  type: string;
  startAt: string;
  endAt?: string | null;
}

export interface DashboardShoppingListDto {
  id: string;
  name: string;
  status: string;
}

export interface DashboardExpenseDto {
  id: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
}

export interface DashboardSummaryDto {
  householdId: string | null;
  date: string;
  tasksToday: TaskDto[];
  eventsToday: DashboardEventDto[];
  openShoppingLists: DashboardShoppingListDto[];
  recentExpenses: DashboardExpenseDto[];
  meowSummary: string;
}
