// Mirrors the backend task payloads exactly
// (Mola_Universe_APP/src/modules/tasks/interface/ITask.ts + validators).

export interface TaskDto {
  id: string;
  createdBy: string;
  assignedTo?: string | null;
  title: string;
  description?: string | null;
  scope: 'PERSONAL' | 'HOUSEHOLD';
  householdId?: string | null;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  completedAt?: string | null;
  completedBy?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  requiresApproval: boolean;
  isOverdue: boolean;
  recurrence: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTasksDto {
  tasks: TaskDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTaskRequestDto {
  title: string;
  dueDate: string;
  description?: string;
  category?: string;
  priority?: string;
  recurrence?: string;
  requiresApproval?: boolean;
  assignedTo?: string;
  householdId?: string;
  scope?: string;
}

export interface CompleteTaskRequestDto {
  approveTask?: boolean;
  approvalNote?: string;
}

export interface AssignTaskRequestDto {
  assignedTo: string | null;
}
