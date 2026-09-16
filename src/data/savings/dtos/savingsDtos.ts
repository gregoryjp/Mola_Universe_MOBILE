// Mirrors the backend savings payloads (modules/savings/interface/ISavings.ts).

export interface SavingsGoalDto {
  id: string;
  createdBy: string;
  scope: string;
  householdId?: string | null;
  name: string;
  notes?: string | null;
  targetAmount: string;
  currency: string;
  boardPreset: string;
  contributionMode?: string | null;
  quotaAmount?: string | null;
  savedAmount: string;
  status: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsCellDto {
  id: string;
  goalId: string;
  denomination: string;
  position: number;
  isMarked: boolean;
  markedBy?: string | null;
  markedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsMovementDto {
  id: string;
  goalId: string;
  cellId: string;
  createdBy: string;
  type: string;
  amount: string;
  balanceAfter: string;
  reversalOfId?: string | null;
  createdAt: string;
}

export interface SavingsContributionDto {
  id: string;
  savingsGoalId: string;
  userId: string;
  amount: string;
  month?: string | null;
  createdAt: string;
}

export interface MarkCellResultDto {
  movement: SavingsMovementDto;
  cell: SavingsCellDto;
  goal: SavingsGoalDto;
  statusChanged: boolean;
  previousStatus: string;
  newStatus: string;
}

export interface PaginatedSavingsGoalsDto {
  goals: SavingsGoalDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateSavingsGoalRequestDto {
  name: string;
  notes?: string;
  targetAmount: string;
  currency: string;
  boardPreset: string;
  denominations?: string[];
  contributionMode?: string;
  quotaAmount?: string;
}

export interface CreateContributionRequestDto {
  amount: string;
  month?: string;
}
