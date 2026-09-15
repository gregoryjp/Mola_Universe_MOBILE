export interface Expense {
  id: string;
  householdId: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  date: string;
  status: 'pending' | 'settled';
}
