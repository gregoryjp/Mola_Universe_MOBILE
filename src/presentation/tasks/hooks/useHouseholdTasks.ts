import { taskRepository } from '@data/tasks/repositories/TaskRepositoryImpl';
import type { ListTasksParams, Task } from '@domain/tasks/entities/Task';
import type { PaginatedTasks } from '@domain/tasks/repositories/TaskRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useInfiniteQuery } from '@tanstack/react-query';

export const householdTasksQueryKey = (
  householdId: string | null,
  params?: Omit<ListTasksParams, 'page'>,
) => ['tasks', 'household', householdId, params ?? {}] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver sus tareas', 400);

/**
 * Tasks of the active household (P0-5). Paginates on purpose: the backend caps a
 * page at 20, so a household with more than that would silently hide the rest.
 */
export const useHouseholdTasks = (params?: Omit<ListTasksParams, 'page'>) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  const query = useInfiniteQuery<PaginatedTasks, AppError>({
    queryKey: householdTasksQueryKey(householdId, params),
    enabled: householdId !== null,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (householdId === null) throw noHousehold();
      const result = await taskRepository.listHousehold(householdId, {
        ...params,
        page: pageParam as number,
      });
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
