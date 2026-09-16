export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskScope = 'PERSONAL' | 'HOUSEHOLD';
export type TaskCategory = 'GENERAL' | 'PETS' | 'BABY' | 'PLANTS' | 'CUSTOM';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROTATIVE';

/** Mirrors the backend `ITaskDTO` (Mola_Universe_APP/src/modules/tasks/interface/ITask.ts). */
export interface Task {
  id: string;
  createdBy: string;
  assignedTo: string | null;
  title: string;
  description: string | null;
  scope: TaskScope;
  householdId: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt: string | null;
  completedBy: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  requiresApproval: boolean;
  isOverdue: boolean;
  recurrence: TaskRecurrence;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  dueDate: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
  requiresApproval?: boolean;
  assignedTo?: string;
  householdId?: string;
  scope?: TaskScope;
}

export interface CompleteTaskInput {
  approveTask?: boolean;
  approvalNote?: string;
}

export interface ListTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  assignedTo?: string;
  category?: TaskCategory;
}
