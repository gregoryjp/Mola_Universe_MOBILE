import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { ShoppingList, ShoppingItem } from '../interface/types';

const KEY = 'shopping';

async function listLists(householdId: string): Promise<ShoppingList[]> {
  const res = await apiClient.get<{ lists: ShoppingList[] }>(`/shopping/households/${householdId}`);
  return res.data.lists;
}

async function listItems(listId: string): Promise<ShoppingItem[]> {
  const res = await apiClient.get<{ items: ShoppingItem[] }>(`/shopping/lists/${listId}/items`);
  return res.data.items;
}

async function addItem(listId: string, data: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const res = await apiClient.post<{ item: ShoppingItem }>(`/shopping/lists/${listId}/items`, data);
  return res.data.item;
}

export function useShopping(householdId?: string, listId?: string) {
  const queryClient = useQueryClient();
  const listsQuery = useQuery({
    queryKey: [KEY, 'lists', householdId],
    queryFn: () => householdId ? listLists(householdId) : [],
  });

  const itemsQuery = useQuery({
    queryKey: [KEY, 'items', listId],
    queryFn: () => listId ? listItems(listId) : [],
    enabled: !!listId,
  });

  const addMutation = useMutation({
    mutationFn: (data: Partial<ShoppingItem>) => addItem(listId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, 'items', listId] }),
  });

  return { lists: listsQuery.data || [], items: itemsQuery.data || [], addItem: addMutation };
}
