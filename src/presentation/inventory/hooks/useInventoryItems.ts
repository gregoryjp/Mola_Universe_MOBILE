import { inventoryRepository } from '@data/inventory/repositories/InventoryRepositoryImpl';
import type { InventoryItem } from '@domain/inventory/entities/InventoryItem';
import type { PaginatedInventoryItems } from '@domain/inventory/repositories/InventoryRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useInfiniteQuery } from '@tanstack/react-query';

export const inventoryItemsQueryKey = (householdId: string | null) =>
  ['inventory', 'items', householdId] as const;

export const useInventoryItems = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  const query = useInfiniteQuery<PaginatedInventoryItems, AppError>({
    queryKey: inventoryItemsQueryKey(householdId),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = { page: pageParam as number };
      const result =
        householdId === null
          ? await inventoryRepository.listPersonalItems(params)
          : await inventoryRepository.listHouseholdItems(householdId, params);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });

  const items: InventoryItem[] = query.data?.pages.flatMap((page) => page.items) ?? [];

  return { ...query, items };
};
