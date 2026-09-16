import type { DashboardSummary } from '../entities/DashboardSummary';

export interface DashboardError {
  code: string;
  message: string;
  statusCode: number;
}

export type DashboardResult<T> =
  | { success: true; value: T }
  | { success: false; error: DashboardError };

/** Dashboard port — backed by the verified `GET /dashboard` route. */
export interface DashboardRepository {
  getSummary(householdId?: string): Promise<DashboardResult<DashboardSummary>>;
}
