import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Notification } from '../interface/types';

export function useNotifications() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get<{ notifications: Notification[] }>('/notifications').then(r => r.data.notifications),
  });
  const m = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  return { notifications: q.data || [], markRead: m };
}
