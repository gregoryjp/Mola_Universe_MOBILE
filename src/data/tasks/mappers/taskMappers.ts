import type {
  Task,
  TaskCategory,
  TaskPriority,
  TaskRecurrence,
  TaskStatus,
} from '@domain/tasks/entities/Task';
import type { PaginatedTasks } from '@domain/tasks/repositories/TaskRepository';
import type { PaginatedTasksDto, TaskDto } from '../dtos/taskDtos';

export const toTask = (dto: TaskDto): Task => ({
  id: dto.id,
  createdBy: dto.createdBy,
  assignedTo: dto.assignedTo ?? null,
  title: dto.title,
  description: dto.description ?? null,
  scope: dto.scope,
  householdId: dto.householdId ?? null,
  category: dto.category as TaskCategory,
  priority: dto.priority as TaskPriority,
  status: dto.status as TaskStatus,
  dueDate: dto.dueDate,
  completedAt: dto.completedAt ?? null,
  completedBy: dto.completedBy ?? null,
  approvedAt: dto.approvedAt ?? null,
  approvedBy: dto.approvedBy ?? null,
  requiresApproval: dto.requiresApproval,
  isOverdue: dto.isOverdue,
  recurrence: dto.recurrence as TaskRecurrence,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toPaginatedTasks = (dto: PaginatedTasksDto): PaginatedTasks => ({
  tasks: dto.tasks.map(toTask),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
});
