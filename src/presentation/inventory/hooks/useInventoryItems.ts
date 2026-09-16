import { inventoryRepository } from '@data/inventory/repositories/InventoryRepositoryImpl';
import type { PaginatedInventoryItems } from '@domain/inventory/repositories/InventoryRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const inventoryItemsQueryKey = (householdId: string | null) =>
  ['inventory', 'items', householdId] as const;

export const useInventoryItems = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<PaginatedInventoryItems, AppError>({
    queryKey: inventoryItemsQueryKey(householdId),
    queryFn: async () => {
      const result =
        householdId === null
          ? await inventoryRepository.listPersonalItems()
          : await inventoryRepository.listHouseholdItems(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};
