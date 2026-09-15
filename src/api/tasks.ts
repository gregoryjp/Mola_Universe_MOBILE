import { apiClient } from './client';
import { TaskEntity } from '../types/entities';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  scope?: 'PERSONAL' | 'HOUSEHOLD';
  householdId?: string;
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROTATIVE';
  recurrenceConfig?: Record<string, unknown>;
  requiresApproval?: boolean;
}

export async function listPersonalTasks(
  filters?: { status?: string; priority?: string }
): Promise<TaskEntity[]> {
  const { data } = await apiClient.get<TaskEntity[]>('/tasks/personal', {
    params: filters,
  });
  return data;
}

export async function listHouseholdTasks(
  householdId: string,
  filters?: { status?: string; priority?: string }
): Promise<TaskEntity[]> {
  const { data } = await apiClient.get<TaskEntity[]>(
    `/households/${householdId}/tasks`,
    { params: filters }
  );
  return data;
}

export async function createPersonalTask(payload: CreateTaskPayload): Promise<TaskEntity> {
  const { data } = await apiClient.post<TaskEntity>('/tasks/personal', payload);
  return data;
}

export async function createHouseholdTask(
  householdId: string,
  payload: CreateTaskPayload
): Promise<TaskEntity> {
  const { data } = await apiClient.post<TaskEntity>(
    `/households/${householdId}/tasks`,
    payload
  );
  return data;
}

export async function completeTask(taskId: string): Promise<TaskEntity> {
  const { data } = await apiClient.post<TaskEntity>(`/tasks/${taskId}/complete`);
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}
