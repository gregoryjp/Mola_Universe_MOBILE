import { dashboardRepository } from '@data/dashboard/repositories/DashboardRepositoryImpl';
import type { DashboardSummary } from '@domain/dashboard/entities/DashboardSummary';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const dashboardQueryKey = (householdId?: string) =>
  ['dashboard', householdId ?? null] as const;

export const useDashboardSummary = (householdId?: string) =>
  useQuery<DashboardSummary, AppError>({
    queryKey: dashboardQueryKey(householdId),
    queryFn: async () => {
      const result = await dashboardRepository.getSummary(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
