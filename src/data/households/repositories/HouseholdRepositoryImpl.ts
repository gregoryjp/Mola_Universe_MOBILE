import { apiClient } from '@data/api/client';
import type { Household } from '@domain/households/entities/Household';
import type {
  HouseholdRepository,
  HouseholdResult,
} from '@domain/households/repositories/HouseholdRepository';
import type { HouseholdDto } from '../dtos/householdDtos';
import { toHousehold } from '../mappers/householdMappers';

export class HouseholdRepositoryImpl implements HouseholdRepository {
  async listMyHouseholds(): Promise<HouseholdResult<Household[]>> {
    const raw = await apiClient.getRaw<HouseholdDto[]>('/households');
    if (raw.success) {
      return { success: true, value: raw.data.map(toHousehold) };
    }
    return {
      success: false,
      error: {
        code: raw.error.code,
        message: raw.error.message,
        statusCode: raw.error.statusCode ?? raw.status,
      },
    };
  }
}

export const householdRepository: HouseholdRepository = new HouseholdRepositoryImpl();
