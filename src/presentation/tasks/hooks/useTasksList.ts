import { taskRepository } from '@data/tasks/repositories/TaskRepositoryImpl';
import type { ListTasksParams, Task } from '@domain/tasks/entities/Task';
import type { PaginatedTasks } from '@domain/tasks/repositories/TaskRepository';
import { AppError } from '@shared/errors/AppError';
import { useInfiniteQuery } from '@tanstack/react-query';

export const tasksListQueryKey = (params?: Omit<ListTasksParams, 'page'>) =>
  ['tasks', 'personal', params ?? {}] as const;

export const useTasksList = (params?: Omit<ListTasksParams, 'page'>) => {
  const query = useInfiniteQuery<PaginatedTasks, AppError>({
    queryKey: tasksListQueryKey(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await taskRepository.listPersonal({ ...params, page: pageParam as number });
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });

  const tasks: Task[] = query.data?.pages.flatMap((page) => page.tasks) ?? [];

  return { ...query, tasks };
};
