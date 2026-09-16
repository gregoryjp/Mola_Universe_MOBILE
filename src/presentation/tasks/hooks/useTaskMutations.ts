import { taskRepository } from '@data/tasks/repositories/TaskRepositoryImpl';
import type { CompleteTaskInput, CreateTaskInput, Task } from '@domain/tasks/entities/Task';
import { AppError } from '@shared/errors/AppError';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const invalidateTasks = (queryClient: ReturnType<typeof useQueryClient>): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: ['tasks'] });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, AppError, CreateTaskInput>({
    mutationFn: async (input) => {
      const result = await taskRepository.createPersonal(input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, AppError, { taskId: string; input?: CompleteTaskInput }>({
    mutationFn: async ({ taskId, input }) => {
      const result = await taskRepository.complete(taskId, input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (taskId) => {
      const result = await taskRepository.remove(taskId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Task,
    AppError,
    { householdId: string; taskId: string; assignedTo: string | null }
  >({
    mutationFn: async ({ householdId, taskId, assignedTo }) => {
      const result = await taskRepository.assign(householdId, taskId, assignedTo);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateTasks(queryClient),
  });
};
