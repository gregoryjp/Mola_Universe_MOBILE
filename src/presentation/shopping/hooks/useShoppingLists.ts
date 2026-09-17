import { shoppingRepository } from '@data/shopping/repositories/ShoppingRepositoryImpl';
import type { ShoppingList } from '@domain/shopping/entities/ShoppingList';
import type { PaginatedShoppingLists } from '@domain/shopping/repositories/ShoppingRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useInfiniteQuery } from '@tanstack/react-query';

export const shoppingListsQueryKey = (householdId: string | null) =>
  ['shopping', 'lists', householdId] as const;

export const useShoppingLists = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  const query = useInfiniteQuery<PaginatedShoppingLists, AppError>({
    queryKey: shoppingListsQueryKey(householdId),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = { page: pageParam as number };
      const result =
        householdId === null
          ? await shoppingRepository.listPersonalLists(params)
          : await shoppingRepository.listHouseholdLists(householdId, params);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });

  const lists: ShoppingList[] = query.data?.pages.flatMap((page) => page.lists) ?? [];

  return { ...query, lists };
};
