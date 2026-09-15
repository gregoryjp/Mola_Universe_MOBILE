import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { Task } from '../interface/types';

const KEY = 'tasks';

async function listTasks(householdId: string): Promise<Task[]> {
  const res = await apiClient.get<{ tasks: Task[] }>(`/tasks/households/${householdId}`);
  return res.data.tasks;
}

async function createTask(householdId: string, data: Partial<Task>): Promise<Task> {
  const res = await apiClient.post<{ task: Task }>(`/tasks/households/${householdId}`, data);
  return res.data.task;
}

async function updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
  const res = await apiClient.patch<{ task: Task }>(`/tasks/${taskId}`, data);
  return res.data.task;
}

export function useTasks(householdId?: string) {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: [KEY, householdId],
    queryFn: () => householdId ? listTasks(householdId) : [],
    enabled: !!householdId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => createTask(householdId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, householdId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, householdId] }),
  });

  return { tasks: tasksQuery.data || [], createTask: createMutation, updateTask: updateMutation };
}
