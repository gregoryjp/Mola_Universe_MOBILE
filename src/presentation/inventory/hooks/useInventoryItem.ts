import { inventoryRepository } from '@data/inventory/repositories/InventoryRepositoryImpl';
import type { InventoryItem, InventoryMovement } from '@domain/inventory/entities/InventoryItem';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const inventoryItemQueryKey = (itemId: string) => ['inventory', 'item', itemId] as const;

export const inventoryMovementsQueryKey = (itemId: string) =>
  ['inventory', 'movements', itemId] as const;

export const useInventoryItem = (itemId: string) =>
  useQuery<InventoryItem, AppError>({
    queryKey: inventoryItemQueryKey(itemId),
    enabled: itemId.length > 0,
    queryFn: async () => {
      const result = await inventoryRepository.getItem(itemId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });

export const useInventoryMovements = (itemId: string) =>
  useQuery<InventoryMovement[], AppError>({
    queryKey: inventoryMovementsQueryKey(itemId),
    enabled: itemId.length > 0,
    queryFn: async () => {
      const result = await inventoryRepository.listMovements(itemId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
