import { inventoryRepository } from '@data/inventory/repositories/InventoryRepositoryImpl';
import type {
  CreateInventoryItemInput,
  CreateMovementInput,
  InventoryItem,
  MovementResult,
} from '@domain/inventory/entities/InventoryItem';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const invalidateInventory = (queryClient: ReturnType<typeof useQueryClient>): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: ['inventory'] });

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation<InventoryItem, AppError, CreateInventoryItemInput>({
    mutationFn: async (input) => {
      const householdId = useHouseholdStore.getState().activeHouseholdId;
      const result =
        householdId === null
          ? await inventoryRepository.createPersonalItem(input)
          : await inventoryRepository.createHouseholdItem(householdId, input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateInventory(queryClient),
  });
};

export const useArchiveInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (itemId) => {
      const result = await inventoryRepository.archiveItem(itemId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: () => invalidateInventory(queryClient),
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  return useMutation<MovementResult, AppError, { itemId: string; input: CreateMovementInput }>({
    mutationFn: async ({ itemId, input }) => {
      const result = await inventoryRepository.createMovement(itemId, input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateInventory(queryClient),
  });
};

export const useReverseMovement = () => {
  const queryClient = useQueryClient();
  return useMutation<MovementResult, AppError, { itemId: string; movementId: string }>({
    mutationFn: async ({ itemId, movementId }) => {
      const result = await inventoryRepository.reverseMovement(itemId, movementId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateInventory(queryClient),
  });
};
