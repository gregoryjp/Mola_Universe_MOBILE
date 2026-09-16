import type { Task } from '@domain/tasks/entities/Task';

export type CalendarEventType =
  | 'GENERAL'
  | 'BIRTHDAY'
  | 'APPOINTMENT'
  | 'PAYMENT'
  | 'SUBSCRIPTION'
  | 'INSURANCE'
  | 'MAINTENANCE'
  | 'PET'
  | 'TRIP'
  | 'CUSTOM';

/**
 * Read-model projections: the dashboard aggregate (ADR-0020) only needs a
 * subset of each source DTO. Full calendar/shopping/expenses slices land in M3+.
 */
export interface DashboardEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  startAt: string;
  endAt: string | null;
}

export interface DashboardShoppingList {
  id: string;
  name: string;
  status: 'OPEN' | 'COMPLETED';
}

export interface DashboardExpense {
  id: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
}

/** Mirrors the backend `IDashboardSummary` (modules/dashboard/interface/IDashboard.ts). */
export interface DashboardSummary {
  householdId: string | null;
  date: string;
  tasksToday: Task[];
  eventsToday: DashboardEvent[];
  openShoppingLists: DashboardShoppingList[];
  recentExpenses: DashboardExpense[];
  meowSummary: string;
}
