export interface Task {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}
