import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Pet } from '../interface/types';

export function usePets(householdId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['pets', householdId],
    queryFn: () => householdId ? apiClient.get<{ pets: Pet[] }>(`/pets/${householdId}`).then(r => r.data.pets) : [],
  });
  const m = useMutation({
    mutationFn: (data: Partial<Pet>) => apiClient.post<{ pet: Pet }>(`/pets/${householdId}`, data).then(r => r.data.pet),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets', householdId] }),
  });
  return { pets: q.data || [], create: m };
}
