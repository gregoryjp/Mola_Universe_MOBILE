import { taskRepository } from '@data/tasks/repositories/TaskRepositoryImpl';
import type { ListTasksParams } from '@domain/tasks/entities/Task';
import type { PaginatedTasks } from '@domain/tasks/repositories/TaskRepository';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const householdTasksQueryKey = (householdId: string, params?: ListTasksParams) =>
  ['tasks', 'household', householdId, params ?? {}] as const;

export const useHouseholdTasks = (householdId: string | null, params?: ListTasksParams) =>
  useQuery<PaginatedTasks, AppError>({
    queryKey: householdTasksQueryKey(householdId ?? 'none', params),
    enabled: householdId !== null,
    queryFn: async () => {
      if (!householdId) throw new AppError('HOUSEHOLD_REQUIRED', 'No household selected');
      const result = await taskRepository.listHousehold(householdId, params);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
