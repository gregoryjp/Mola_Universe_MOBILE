import { shoppingRepository } from '@data/shopping/repositories/ShoppingRepositoryImpl';
import type { PaginatedShoppingLists } from '@domain/shopping/repositories/ShoppingRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const shoppingListsQueryKey = (householdId: string | null) =>
  ['shopping', 'lists', householdId] as const;

export const useShoppingLists = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<PaginatedShoppingLists, AppError>({
    queryKey: shoppingListsQueryKey(householdId),
    queryFn: async () => {
      const result =
        householdId === null
          ? await shoppingRepository.listPersonalLists()
          : await shoppingRepository.listHouseholdLists(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};
