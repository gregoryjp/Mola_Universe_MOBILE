import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { DashboardSummary } from '../interface/types';

export function useDashboard(householdId?: string) {
  const q = useQuery({
    queryKey: ['dashboard', householdId],
    queryFn: () => householdId ? apiClient.get<{ summary: DashboardSummary }>(`/dashboard/${householdId}`).then(r => r.data.summary) : null,
  });
  return { summary: q.data, isLoading: q.isLoading };
}
