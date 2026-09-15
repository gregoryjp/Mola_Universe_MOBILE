export interface UserEntity {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface HouseholdEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMemberEntity {
  id: string;
  householdId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user?: UserEntity;
}

export interface TaskEntity {
  id: string;
  createdBy: string;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  scope: 'PERSONAL' | 'HOUSEHOLD';
  householdId?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ROTATIVE';
  recurrenceConfig?: Record<string, unknown>;
  requiresApproval: boolean;
}

export interface ExpenseEntity {
  id: string;
  householdId: string;
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  createdBy: string;
  category?: string;
  receiptReference?: string;
  date: string;
  status: 'PENDING' | 'SETTLED';
  totalPaid: string;
  remainingAmount: string;
  splits: Array<{
    id: string;
    userId: string;
    amount: string;
    owedBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListEntity {
  id: string;
  createdBy: string;
  scope: 'PERSONAL' | 'HOUSEHOLD';
  householdId?: string;
  name: string;
  status: 'OPEN' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItemEntity {
  id: string;
  listId: string;
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}
