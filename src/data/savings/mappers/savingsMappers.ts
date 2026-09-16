import type {
  CreateContributionInput,
  CreateSavingsGoalInput,
  MarkCellResult,
  SavingsBoardPreset,
  SavingsCell,
  SavingsContribution,
  SavingsContributionMode,
  SavingsGoal,
  SavingsGoalStatus,
  SavingsMovement,
  SavingsMovementType,
  SavingsScope,
} from '@domain/savings/entities/SavingsGoal';
import type { PaginatedSavingsGoals } from '@domain/savings/repositories/SavingsRepository';
import type {
  CreateContributionRequestDto,
  CreateSavingsGoalRequestDto,
  MarkCellResultDto,
  PaginatedSavingsGoalsDto,
  SavingsCellDto,
  SavingsContributionDto,
  SavingsGoalDto,
  SavingsMovementDto,
} from '../dtos/savingsDtos';

export const toSavingsGoal = (dto: SavingsGoalDto): SavingsGoal => ({
  id: dto.id,
  createdBy: dto.createdBy,
  scope: dto.scope as SavingsScope,
  householdId: dto.householdId ?? null,
  name: dto.name,
  notes: dto.notes ?? null,
  targetAmount: dto.targetAmount,
  currency: dto.currency,
  boardPreset: dto.boardPreset as SavingsBoardPreset,
  contributionMode: (dto.contributionMode as SavingsContributionMode | null) ?? null,
  quotaAmount: dto.quotaAmount ?? null,
  savedAmount: dto.savedAmount,
  status: dto.status as SavingsGoalStatus,
  completedAt: dto.completedAt ?? null,
  cancelledAt: dto.cancelledAt ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toSavingsCell = (dto: SavingsCellDto): SavingsCell => ({
  id: dto.id,
  goalId: dto.goalId,
  denomination: dto.denomination,
  position: dto.position,
  isMarked: dto.isMarked,
  markedBy: dto.markedBy ?? null,
  markedAt: dto.markedAt ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toSavingsMovement = (dto: SavingsMovementDto): SavingsMovement => ({
  id: dto.id,
  goalId: dto.goalId,
  cellId: dto.cellId,
  createdBy: dto.createdBy,
  type: dto.type as SavingsMovementType,
  amount: dto.amount,
  balanceAfter: dto.balanceAfter,
  reversalOfId: dto.reversalOfId ?? null,
  createdAt: dto.createdAt,
});

export const toSavingsContribution = (dto: SavingsContributionDto): SavingsContribution => ({
  id: dto.id,
  savingsGoalId: dto.savingsGoalId,
  userId: dto.userId,
  amount: dto.amount,
  month: dto.month ?? null,
  createdAt: dto.createdAt,
});

export const toMarkCellResult = (dto: MarkCellResultDto): MarkCellResult => ({
  movement: toSavingsMovement(dto.movement),
  cell: toSavingsCell(dto.cell),
  goal: toSavingsGoal(dto.goal),
  statusChanged: dto.statusChanged,
  previousStatus: dto.previousStatus as SavingsGoalStatus,
  newStatus: dto.newStatus as SavingsGoalStatus,
});

export const toPaginatedSavingsGoals = (dto: PaginatedSavingsGoalsDto): PaginatedSavingsGoals => ({
  goals: dto.goals.map(toSavingsGoal),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
});

export const toCreateSavingsGoalRequest = (
  input: CreateSavingsGoalInput,
): CreateSavingsGoalRequestDto => ({
  name: input.name,
  targetAmount: input.targetAmount,
  currency: input.currency,
  boardPreset: input.boardPreset,
  ...(input.notes !== undefined && { notes: input.notes }),
  ...(input.denominations !== undefined && { denominations: input.denominations }),
  ...(input.contributionMode !== undefined && { contributionMode: input.contributionMode }),
  ...(input.quotaAmount !== undefined && { quotaAmount: input.quotaAmount }),
});

export const toCreateContributionRequest = (
  input: CreateContributionInput,
): CreateContributionRequestDto => ({
  amount: input.amount,
  ...(input.month !== undefined && { month: input.month }),
});
