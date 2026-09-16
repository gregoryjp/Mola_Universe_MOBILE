// Mirrors the backend savings contracts (modules/savings/interface/ISavings.ts).

export type SavingsScope = 'PERSONAL' | 'HOUSEHOLD';

export type SavingsBoardPreset = 'SMALL' | 'MEDIUM' | 'LARGE' | 'CUSTOM';

export type SavingsGoalStatus = 'OPEN' | 'COMPLETED';

export type SavingsMovementType = 'MARK' | 'REVERSAL';

export type SavingsContributionMode = 'QUOTA' | 'FREE';

export interface SavingsGoal {
  id: string;
  createdBy: string;
  scope: SavingsScope;
  householdId: string | null;
  name: string;
  notes: string | null;
  /** Decimal as string (backend keeps precision as string). */
  targetAmount: string;
  currency: string;
  boardPreset: SavingsBoardPreset;
  contributionMode: SavingsContributionMode | null;
  quotaAmount: string | null;
  savedAmount: string;
  status: SavingsGoalStatus;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsCell {
  id: string;
  goalId: string;
  /** Face value of the cell (e.g. "50.00"). */
  denomination: string;
  position: number;
  isMarked: boolean;
  markedBy: string | null;
  markedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsMovement {
  id: string;
  goalId: string;
  cellId: string;
  createdBy: string;
  type: SavingsMovementType;
  amount: string;
  balanceAfter: string;
  reversalOfId: string | null;
  createdAt: string;
}

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  userId: string;
  amount: string;
  /** "YYYY-MM"; required for QUOTA goals. */
  month: string | null;
  createdAt: string;
}

/**
 * Result of marking/unmarking a cell. The backend returns the new movement,
 * the updated cell and goal, plus whether the goal status flipped.
 */
export interface MarkCellResult {
  movement: SavingsMovement;
  cell: SavingsCell;
  goal: SavingsGoal;
  statusChanged: boolean;
  previousStatus: SavingsGoalStatus;
  newStatus: SavingsGoalStatus;
}

export interface CreateSavingsGoalInput {
  name: string;
  notes?: string;
  targetAmount: string;
  currency: string;
  boardPreset: SavingsBoardPreset;
  /** Required for the CUSTOM preset; ignored otherwise. */
  denominations?: string[];
  /** Household goals only (ADR-0022). */
  contributionMode?: SavingsContributionMode;
  /** Required when contributionMode is "QUOTA". */
  quotaAmount?: string;
}

export interface CreateContributionInput {
  amount: string;
  /** "YYYY-MM"; required if the goal's contributionMode is "QUOTA". */
  month?: string;
}
