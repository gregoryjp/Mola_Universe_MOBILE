import { shoppingRepository } from '@data/shopping/repositories/ShoppingRepositoryImpl';
import type {
  CreatedShoppingItem,
  CreateShoppingItemInput,
  CreateShoppingListInput,
  ShoppingItem,
  ShoppingList,
} from '@domain/shopping/entities/ShoppingList';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const invalidateShopping = (queryClient: ReturnType<typeof useQueryClient>): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: ['shopping'] });

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();
  return useMutation<ShoppingList, AppError, CreateShoppingListInput>({
    mutationFn: async (input) => {
      const householdId = useHouseholdStore.getState().activeHouseholdId;
      const result =
        householdId === null
          ? await shoppingRepository.createPersonalList(input)
          : await shoppingRepository.createHouseholdList(householdId, input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateShopping(queryClient),
  });
};

export const useAddShoppingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CreatedShoppingItem,
    AppError,
    { listId: string; input: CreateShoppingItemInput }
  >({
    mutationFn: async ({ listId, input }) => {
      const result = await shoppingRepository.addItem(listId, input);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateShopping(queryClient),
  });
};

type ItemAction = { listId: string; itemId: string };

const useItemMutation = (
  action: (listId: string, itemId: string) => ReturnType<typeof shoppingRepository.purchaseItem>,
) => {
  const queryClient = useQueryClient();
  return useMutation<ShoppingItem, AppError, ItemAction>({
    mutationFn: async ({ listId, itemId }) => {
      const result = await action(listId, itemId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
    onSuccess: () => invalidateShopping(queryClient),
  });
};

export const usePurchaseItem = () =>
  useItemMutation((listId, itemId) => shoppingRepository.purchaseItem(listId, itemId));

export const useCancelItem = () =>
  useItemMutation((listId, itemId) => shoppingRepository.cancelItem(listId, itemId));

export const useReopenItem = () =>
  useItemMutation((listId, itemId) => shoppingRepository.reopenItem(listId, itemId));

export const useDeleteShoppingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, ItemAction>({
    mutationFn: async ({ listId, itemId }) => {
      const result = await shoppingRepository.deleteItem(listId, itemId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: () => invalidateShopping(queryClient),
  });
};
