import { taskRepository } from '@data/tasks/repositories/TaskRepositoryImpl';
import type { Task } from '@domain/tasks/entities/Task';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const taskQueryKey = (taskId: string) => ['tasks', 'detail', taskId] as const;

export const useTaskDetail = (taskId: string) =>
  useQuery<Task, AppError>({
    queryKey: taskQueryKey(taskId),
    enabled: taskId.length > 0,
    queryFn: async () => {
      const result = await taskRepository.getTask(taskId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
