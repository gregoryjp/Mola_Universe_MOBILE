import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { CalendarEvent } from '../interface/types';

export function useCalendar(householdId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['calendar', householdId],
    queryFn: () => householdId ? apiClient.get<{ events: CalendarEvent[] }>(`/calendar/${householdId}`).then(r => r.data.events) : [],
  });
  const m = useMutation({
    mutationFn: (data: Partial<CalendarEvent>) => apiClient.post<{ event: CalendarEvent }>(`/calendar/${householdId}`, data).then(r => r.data.event),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar', householdId] }),
  });
  return { events: q.data || [], create: m };
}
