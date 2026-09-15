export interface SavingsGoal {
  id: string;
  householdId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'active' | 'completed' | 'abandoned';
}
