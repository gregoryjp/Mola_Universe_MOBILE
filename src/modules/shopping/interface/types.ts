export interface ShoppingList {
  id: string;
  householdId: string;
  name: string;
  createdAt: string;
}
export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit?: string;
  purchased: boolean;
}
