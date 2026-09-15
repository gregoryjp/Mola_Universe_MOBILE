import { apiClient } from './client';
import { ShoppingListEntity, ShoppingItemEntity } from '../types/entities';

export async function listPersonalShoppingLists(): Promise<ShoppingListEntity[]> {
  const { data } = await apiClient.get<ShoppingListEntity[]>('/shopping-lists/personal');
  return data;
}

export async function listHouseholdShoppingLists(householdId: string): Promise<ShoppingListEntity[]> {
  const { data } = await apiClient.get<ShoppingListEntity[]>(
    `/households/${householdId}/shopping-lists`
  );
  return data;
}

export async function getShoppingList(listId: string): Promise<ShoppingListEntity> {
  const { data } = await apiClient.get<ShoppingListEntity>(`/shopping-lists/${listId}`);
  return data;
}

export async function createShoppingList(name: string): Promise<ShoppingListEntity> {
  const { data } = await apiClient.post<ShoppingListEntity>('/shopping-lists/personal', {
    name,
  });
  return data;
}

export async function createHouseholdShoppingList(
  householdId: string,
  name: string
): Promise<ShoppingListEntity> {
  const { data } = await apiClient.post<ShoppingListEntity>(
    `/households/${householdId}/shopping-lists`,
    { name }
  );
  return data;
}

export async function addShoppingListItem(
  listId: string,
  item: { name: string; quantity?: number; unit?: string; notes?: string }
): Promise<ShoppingItemEntity> {
  const { data } = await apiClient.post<ShoppingItemEntity>(
    `/shopping-lists/${listId}/items`,
    item
  );
  return data;
}

export async function toggleShoppingListItem(
  listId: string,
  itemId: string,
  status: 'PENDING' | 'COMPLETED'
): Promise<ShoppingItemEntity> {
  const { data } = await apiClient.patch<ShoppingItemEntity>(
    `/shopping-lists/${listId}/items/${itemId}`,
    { status }
  );
  return data;
}
