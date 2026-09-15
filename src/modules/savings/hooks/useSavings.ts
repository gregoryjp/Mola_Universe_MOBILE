import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { SavingsGoal } from '../interface/types';

export function useSavings(householdId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['savings', householdId],
    queryFn: () => householdId ? apiClient.get<{ goals: SavingsGoal[] }>(`/savings/${householdId}`).then(r => r.data.goals) : [],
  });
  const m = useMutation({
    mutationFn: (data: Partial<SavingsGoal>) => apiClient.post<{ goal: SavingsGoal }>(`/savings/${householdId}`, data).then(r => r.data.goal),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings', householdId] }),
  });
  return { goals: q.data || [], create: m };
}
