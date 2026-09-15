export interface Item {
  id: string;
  householdId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}
export interface Movement {
  id: string;
  itemId: string;
  type: 'add' | 'remove';
  quantity: number;
  timestamp: string;
  notes?: string;
}
