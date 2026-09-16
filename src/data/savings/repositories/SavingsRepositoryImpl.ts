import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreateContributionInput,
  CreateSavingsGoalInput,
  MarkCellResult,
  SavingsCell,
  SavingsContribution,
  SavingsGoal,
  SavingsMovement,
} from '@domain/savings/entities/SavingsGoal';
import type {
  PageParams,
  PaginatedSavingsGoals,
  SavingsRepository,
  SavingsResult,
} from '@domain/savings/repositories/SavingsRepository';
import type {
  CreateContributionRequestDto,
  MarkCellResultDto,
  PaginatedSavingsGoalsDto,
  SavingsCellDto,
  SavingsContributionDto,
  SavingsGoalDto,
  SavingsMovementDto,
} from '../dtos/savingsDtos';
import {
  toCreateContributionRequest,
  toCreateSavingsGoalRequest,
  toMarkCellResult,
  toPaginatedSavingsGoals,
  toSavingsCell,
  toSavingsContribution,
  toSavingsGoal,
  toSavingsMovement,
} from '../mappers/savingsMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): SavingsResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const emptyOk = (): SavingsResult<void> => ({ success: true, value: undefined });

const queryString = (params?: PageParams): string => {
  if (!params) return '';
  const parts: string[] = [];
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

export class SavingsRepositoryImpl implements SavingsRepository {
  async listPersonalGoals(params?: PageParams): Promise<SavingsResult<PaginatedSavingsGoals>> {
    const raw = await apiClient.getRaw<PaginatedSavingsGoalsDto>(
      `/users/savings-goals${queryString(params)}`,
    );
    return toResult(raw, toPaginatedSavingsGoals);
  }

  async createPersonalGoal(input: CreateSavingsGoalInput): Promise<SavingsResult<SavingsGoal>> {
    const body = toCreateSavingsGoalRequest(input);
    const raw = await apiClient.postRaw<SavingsGoalDto>('/users/savings-goals', body);
    return toResult(raw, toSavingsGoal);
  }

  async getGoal(goalId: string): Promise<SavingsResult<SavingsGoal>> {
    const raw = await apiClient.getRaw<SavingsGoalDto>(`/users/savings-goals/${goalId}`);
    return toResult(raw, toSavingsGoal);
  }

  async deleteGoal(goalId: string): Promise<SavingsResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/users/savings-goals/${goalId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }

  async listHouseholdGoals(
    householdId: string,
    params?: PageParams,
  ): Promise<SavingsResult<PaginatedSavingsGoals>> {
    const raw = await apiClient.getRaw<PaginatedSavingsGoalsDto>(
      `/households/${householdId}/savings-goals${queryString(params)}`,
    );
    return toResult(raw, toPaginatedSavingsGoals);
  }

  async createHouseholdGoal(
    householdId: string,
    input: CreateSavingsGoalInput,
  ): Promise<SavingsResult<SavingsGoal>> {
    const body = toCreateSavingsGoalRequest(input);
    const raw = await apiClient.postRaw<SavingsGoalDto>(
      `/households/${householdId}/savings-goals`,
      body,
    );
    return toResult(raw, toSavingsGoal);
  }

  async listCells(goalId: string): Promise<SavingsResult<SavingsCell[]>> {
    const raw = await apiClient.getRaw<SavingsCellDto[]>(`/savings-goals/${goalId}/cells`);
    return raw.success
      ? { success: true, value: raw.data.map(toSavingsCell) }
      : { success: false, error: toError(raw) };
  }

  async markCell(goalId: string, cellId: string): Promise<SavingsResult<MarkCellResult>> {
    const raw = await apiClient.patchRaw<MarkCellResultDto>(
      `/savings-goals/${goalId}/cells/${cellId}/mark`,
    );
    return toResult(raw, toMarkCellResult);
  }

  async unmarkCell(goalId: string, cellId: string): Promise<SavingsResult<MarkCellResult>> {
    const raw = await apiClient.patchRaw<MarkCellResultDto>(
      `/savings-goals/${goalId}/cells/${cellId}/unmark`,
    );
    return toResult(raw, toMarkCellResult);
  }

  async listMovements(goalId: string): Promise<SavingsResult<SavingsMovement[]>> {
    const raw = await apiClient.getRaw<SavingsMovementDto[]>(`/savings-goals/${goalId}/movements`);
    return raw.success
      ? { success: true, value: raw.data.map(toSavingsMovement) }
      : { success: false, error: toError(raw) };
  }

  async createContribution(
    goalId: string,
    input: CreateContributionInput,
  ): Promise<SavingsResult<SavingsContribution>> {
    const body: CreateContributionRequestDto = toCreateContributionRequest(input);
    const raw = await apiClient.postRaw<SavingsContributionDto>(
      `/savings-goals/${goalId}/contributions`,
      body,
    );
    return toResult(raw, toSavingsContribution);
  }

  async listContributions(goalId: string): Promise<SavingsResult<SavingsContribution[]>> {
    const raw = await apiClient.getRaw<SavingsContributionDto[]>(
      `/savings-goals/${goalId}/contributions`,
    );
    return raw.success
      ? { success: true, value: raw.data.map(toSavingsContribution) }
      : { success: false, error: toError(raw) };
  }
}

export const savingsRepository: SavingsRepository = new SavingsRepositoryImpl();
