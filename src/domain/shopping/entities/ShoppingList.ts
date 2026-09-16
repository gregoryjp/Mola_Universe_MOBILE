export type ShoppingScope = 'PERSONAL' | 'HOUSEHOLD';
export type ShoppingListStatus = 'OPEN' | 'COMPLETED';
export type ShoppingItemStatus = 'PENDING' | 'PURCHASED' | 'CANCELLED';

/** Mirrors the backend `IShoppingListDTO` (modules/shopping/interface/IShopping.ts). */
export interface ShoppingList {
  id: string;
  createdBy: string;
  scope: ShoppingScope;
  householdId: string | null;
  name: string;
  notes: string | null;
  status: ShoppingListStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  addedBy: string;
  name: string;
  quantity: string;
  unit: string;
  notes: string | null;
  status: ShoppingItemStatus;
  purchasedBy: string | null;
  purchasedAt: string | null;
  copiedFromItemId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateGroup {
  normalizedName: string;
  normalizedUnit: string;
  items: ShoppingItem[];
}

/** Result of adding an item: the item plus pre-existing near-duplicates. */
export interface CreatedShoppingItem {
  item: ShoppingItem;
  duplicateSuggestions: ShoppingItem[];
}

export interface CreateShoppingListInput {
  name: string;
  notes?: string;
}

export interface CreateShoppingItemInput {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
}

export interface UpdateShoppingItemInput {
  name?: string;
  quantity?: string;
  unit?: string;
  notes?: string;
}
