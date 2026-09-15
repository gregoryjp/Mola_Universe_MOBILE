import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Expense } from '../interface/types';

export function useExpenses(householdId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['expenses', householdId],
    queryFn: () => householdId ? apiClient.get<{ expenses: Expense[] }>(`/expenses/${householdId}`).then(r => r.data.expenses) : [],
  });
  const m = useMutation({
    mutationFn: (data: Partial<Expense>) => apiClient.post<{ expense: Expense }>(`/expenses/${householdId}`, data).then(r => r.data.expense),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', householdId] }),
  });
  return { expenses: q.data || [], create: m };
}
