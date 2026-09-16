import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type { CreateHouseholdInput, Household } from '@domain/households/entities/Household';
import type {
  HouseholdRepository,
  HouseholdResult,
} from '@domain/households/repositories/HouseholdRepository';
import type { HouseholdDto } from '../dtos/householdDtos';
import { toCreateHouseholdRequest, toHousehold } from '../mappers/householdMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

export class HouseholdRepositoryImpl implements HouseholdRepository {
  async listMyHouseholds(): Promise<HouseholdResult<Household[]>> {
    const raw = await apiClient.getRaw<HouseholdDto[]>('/households');
    if (raw.success) {
      return { success: true, value: raw.data.map(toHousehold) };
    }
    return { success: false, error: toError(raw) };
  }

  async createHousehold(input: CreateHouseholdInput): Promise<HouseholdResult<Household>> {
    const body = toCreateHouseholdRequest(input);
    const raw = await apiClient.postRaw<HouseholdDto>('/households', body);
    if (raw.success) {
      return { success: true, value: toHousehold(raw.data) };
    }
    return { success: false, error: toError(raw) };
  }
}

export const householdRepository: HouseholdRepository = new HouseholdRepositoryImpl();
