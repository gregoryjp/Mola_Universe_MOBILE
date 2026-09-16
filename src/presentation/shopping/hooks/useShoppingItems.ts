import { shoppingRepository } from '@data/shopping/repositories/ShoppingRepositoryImpl';
import type { ShoppingItem } from '@domain/shopping/entities/ShoppingList';
import { AppError } from '@shared/errors/AppError';
import { useQuery } from '@tanstack/react-query';

export const shoppingItemsQueryKey = (listId: string) => ['shopping', 'items', listId] as const;

export const useShoppingItems = (listId: string) =>
  useQuery<ShoppingItem[], AppError>({
    queryKey: shoppingItemsQueryKey(listId),
    enabled: listId.length > 0,
    queryFn: async () => {
      const result = await shoppingRepository.listItems(listId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
