import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { EmergencyContact } from '../interface/types';

export function useSos(householdId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['sos', householdId],
    queryFn: () => householdId ? apiClient.get<{ contacts: EmergencyContact[] }>(`/sos/${householdId}`).then(r => r.data.contacts) : [],
  });
  const m = useMutation({
    mutationFn: (data: Partial<EmergencyContact>) => apiClient.post<{ contact: EmergencyContact }>(`/sos/${householdId}`, data).then(r => r.data.contact),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sos', householdId] }),
  });
  return { contacts: q.data || [], add: m };
}
