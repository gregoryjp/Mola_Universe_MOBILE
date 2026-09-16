import type {
  CreateContributionInput,
  CreateSavingsGoalInput,
  MarkCellResult,
  SavingsCell,
  SavingsContribution,
  SavingsGoal,
  SavingsMovement,
} from '../entities/SavingsGoal';

export interface SavingsError {
  code: string;
  message: string;
  statusCode: number;
}

export type SavingsResult<T> =
  | { success: true; value: T }
  | { success: false; error: SavingsError };

export interface PageParams {
  page?: number;
  limit?: number;
}

export interface PaginatedSavingsGoals {
  goals: SavingsGoal[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Savings port. Personal goals live under `/users/savings-goals`; household
 * goals under `/households/:householdId/savings-goals`. The board, ledger and
 * contributions hang off the goal itself (access checked from the goal), so
 * those routes carry no scope prefix.
 * Verified in modules/savings/routes/savingsRoutes.ts.
 */
export interface SavingsRepository {
  listPersonalGoals(params?: PageParams): Promise<SavingsResult<PaginatedSavingsGoals>>;
  createPersonalGoal(input: CreateSavingsGoalInput): Promise<SavingsResult<SavingsGoal>>;
  getGoal(goalId: string): Promise<SavingsResult<SavingsGoal>>;
  deleteGoal(goalId: string): Promise<SavingsResult<void>>;
  listHouseholdGoals(
    householdId: string,
    params?: PageParams,
  ): Promise<SavingsResult<PaginatedSavingsGoals>>;
  createHouseholdGoal(
    householdId: string,
    input: CreateSavingsGoalInput,
  ): Promise<SavingsResult<SavingsGoal>>;
  listCells(goalId: string): Promise<SavingsResult<SavingsCell[]>>;
  markCell(goalId: string, cellId: string): Promise<SavingsResult<MarkCellResult>>;
  unmarkCell(goalId: string, cellId: string): Promise<SavingsResult<MarkCellResult>>;
  listMovements(goalId: string): Promise<SavingsResult<SavingsMovement[]>>;
  createContribution(
    goalId: string,
    input: CreateContributionInput,
  ): Promise<SavingsResult<SavingsContribution>>;
  listContributions(goalId: string): Promise<SavingsResult<SavingsContribution[]>>;
}
