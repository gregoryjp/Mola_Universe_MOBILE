import { taskRepository } from '@data/tasks/repositories/TaskRepositoryImpl';
import type { ListTasksParams } from '@domain/tasks/entities/Task';
import type { PaginatedTasks } from '@domain/tasks/repositories/TaskRepository';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const tasksListQueryKey = (params?: ListTasksParams) =>
  ['tasks', 'personal', params ?? {}] as const;

export const useTasksList = (params?: ListTasksParams) =>
  useQuery<PaginatedTasks, AppError>({
    queryKey: tasksListQueryKey(params),
    queryFn: async () => {
      const result = await taskRepository.listPersonal(params);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
