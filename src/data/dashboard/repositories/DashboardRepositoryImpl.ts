import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type { DashboardSummary } from '@domain/dashboard/entities/DashboardSummary';
import type {
  DashboardRepository,
  DashboardResult,
} from '@domain/dashboard/repositories/DashboardRepository';
import type { DashboardSummaryDto } from '../dtos/dashboardDtos';
import { toDashboardSummary } from '../mappers/dashboardMappers';

export class DashboardRepositoryImpl implements DashboardRepository {
  async getSummary(householdId?: string): Promise<DashboardResult<DashboardSummary>> {
    const path = householdId ? `/dashboard?householdId=${householdId}` : '/dashboard';
    const raw: RawResult<DashboardSummaryDto> = await apiClient.getRaw<DashboardSummaryDto>(path);

    if (raw.success) {
      return { success: true, value: toDashboardSummary(raw.data) };
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

export const dashboardRepository: DashboardRepository = new DashboardRepositoryImpl();
