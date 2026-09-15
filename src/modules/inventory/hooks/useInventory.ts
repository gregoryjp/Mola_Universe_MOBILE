import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Item, Movement } from '../interface/types';

const KEY = 'inventory';

async function listItems(householdId: string): Promise<Item[]> {
  const res = await apiClient.get<{ items: Item[] }>(`/inventory/households/${householdId}/items`);
  return res.data.items;
}

async function addMovement(itemId: string, type: 'add' | 'remove', quantity: number): Promise<Movement> {
  const res = await apiClient.post<{ movement: Movement }>(`/inventory/items/${itemId}/movements`, { type, quantity });
  return res.data.movement;
}

export function useInventory(householdId?: string) {
  const queryClient = useQueryClient();
  const itemsQuery = useQuery({
    queryKey: [KEY, householdId],
    queryFn: () => householdId ? listItems(householdId) : [],
    enabled: !!householdId,
  });

  const movementMutation = useMutation({
    mutationFn: ({ itemId, type, qty }: { itemId: string; type: 'add' | 'remove'; qty: number }) =>
      addMovement(itemId, type, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, householdId] });
    },
  });

  return { items: itemsQuery.data || [], isLoading: itemsQuery.isLoading, addMovement: movementMutation };
}
