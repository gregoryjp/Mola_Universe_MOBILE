import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Message } from '../interface/types';

export function useMeow(conversationId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['meow', conversationId],
    queryFn: () => conversationId ? apiClient.get<{ messages: Message[] }>(`/meow/${conversationId}`).then(r => r.data.messages) : [],
  });
  const m = useMutation({
    mutationFn: (content: string) => apiClient.post<{ message: Message }>(`/meow/${conversationId}/messages`, { content }).then(r => r.data.message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meow', conversationId] }),
  });
  return { messages: q.data || [], sendMessage: m };
}
