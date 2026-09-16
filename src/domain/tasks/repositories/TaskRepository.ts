import type { CompleteTaskInput, CreateTaskInput, ListTasksParams, Task } from '../entities/Task';

/** Typed error forwarded from the backend (ADR-0010). */
export interface TaskError {
  code: string;
  message: string;
  statusCode: number;
}

export type TaskResult<T> = { success: true; value: T } | { success: false; error: TaskError };

export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Tasks port. Endpoints map 1:1 to the verified backend routes (see
 * logs/mobile-m2-2026-09-17.md). Note the real routes live under `/users/tasks`
 * and `/households/:householdId/tasks` — there is no generic `/tasks/:id` update.
 */
export interface TaskRepository {
  listPersonal(params?: ListTasksParams): Promise<TaskResult<PaginatedTasks>>;
  getTask(taskId: string): Promise<TaskResult<Task>>;
  createPersonal(input: CreateTaskInput): Promise<TaskResult<Task>>;
  complete(taskId: string, input?: CompleteTaskInput): Promise<TaskResult<Task>>;
  remove(taskId: string): Promise<TaskResult<void>>;
  listHousehold(householdId: string, params?: ListTasksParams): Promise<TaskResult<PaginatedTasks>>;
  createHousehold(householdId: string, input: CreateTaskInput): Promise<TaskResult<Task>>;
  assign(householdId: string, taskId: string, assignedTo: string | null): Promise<TaskResult<Task>>;
}
