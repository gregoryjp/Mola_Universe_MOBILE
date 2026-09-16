import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CompleteTaskInput,
  CreateTaskInput,
  ListTasksParams,
  Task,
} from '@domain/tasks/entities/Task';
import type {
  PaginatedTasks,
  TaskRepository,
  TaskResult,
} from '@domain/tasks/repositories/TaskRepository';
import type {
  AssignTaskRequestDto,
  CompleteTaskRequestDto,
  CreateTaskRequestDto,
  PaginatedTasksDto,
  TaskDto,
} from '../dtos/taskDtos';
import { toPaginatedTasks, toTask } from '../mappers/taskMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): TaskResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const queryString = (params?: ListTasksParams): string => {
  if (!params) return '';
  const parts: string[] = [];
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
  if (params.status) parts.push(`status=${params.status}`);
  if (params.assignedTo) parts.push(`assignedTo=${params.assignedTo}`);
  if (params.category) parts.push(`category=${params.category}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

const toCreateDto = (input: CreateTaskInput): CreateTaskRequestDto => ({ ...input });

export class TaskRepositoryImpl implements TaskRepository {
  async listPersonal(params?: ListTasksParams): Promise<TaskResult<PaginatedTasks>> {
    const raw = await apiClient.getRaw<PaginatedTasksDto>(`/users/tasks${queryString(params)}`);
    return toResult(raw, toPaginatedTasks);
  }

  async getTask(taskId: string): Promise<TaskResult<Task>> {
    const raw = await apiClient.getRaw<TaskDto>(`/users/tasks/${taskId}`);
    return toResult(raw, toTask);
  }

  async createPersonal(input: CreateTaskInput): Promise<TaskResult<Task>> {
    const raw = await apiClient.postRaw<TaskDto>('/users/tasks', toCreateDto(input));
    return toResult(raw, toTask);
  }

  async complete(taskId: string, input?: CompleteTaskInput): Promise<TaskResult<Task>> {
    const body: CompleteTaskRequestDto = input ?? {};
    const raw = await apiClient.patchRaw<TaskDto>(`/users/tasks/${taskId}/complete`, body);
    return toResult(raw, toTask);
  }

  async remove(taskId: string): Promise<TaskResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/users/tasks/${taskId}`);
    return raw.success
      ? { success: true, value: undefined }
      : { success: false, error: toError(raw) };
  }

  async listHousehold(
    householdId: string,
    params?: ListTasksParams,
  ): Promise<TaskResult<PaginatedTasks>> {
    const raw = await apiClient.getRaw<PaginatedTasksDto>(
      `/households/${householdId}/tasks${queryString(params)}`,
    );
    return toResult(raw, toPaginatedTasks);
  }

  async createHousehold(householdId: string, input: CreateTaskInput): Promise<TaskResult<Task>> {
    const raw = await apiClient.postRaw<TaskDto>(
      `/households/${householdId}/tasks`,
      toCreateDto(input),
    );
    return toResult(raw, toTask);
  }

  async assign(
    householdId: string,
    taskId: string,
    assignedTo: string | null,
  ): Promise<TaskResult<Task>> {
    const body: AssignTaskRequestDto = { assignedTo };
    const raw = await apiClient.patchRaw<TaskDto>(
      `/households/${householdId}/tasks/${taskId}/assign`,
      body,
    );
    return toResult(raw, toTask);
  }
}

export const taskRepository: TaskRepository = new TaskRepositoryImpl();
