// Mirrors the backend shopping payloads (modules/shopping/interface/IShopping.ts).

export interface ShoppingListDto {
  id: string;
  createdBy: string;
  scope: 'PERSONAL' | 'HOUSEHOLD';
  householdId?: string | null;
  name: string;
  notes?: string | null;
  status: 'OPEN' | 'COMPLETED';
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItemDto {
  id: string;
  listId: string;
  addedBy: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string | null;
  status: 'PENDING' | 'PURCHASED' | 'CANCELLED';
  purchasedBy?: string | null;
  purchasedAt?: string | null;
  copiedFromItemId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateGroupDto {
  normalizedName: string;
  normalizedUnit: string;
  items: ShoppingItemDto[];
}

export interface CreatedShoppingItemDto {
  item: ShoppingItemDto;
  duplicateSuggestions: ShoppingItemDto[];
}

export interface PaginatedShoppingListsDto {
  lists: ShoppingListDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateShoppingListRequestDto {
  name: string;
  notes?: string;
}

export interface CreateShoppingItemRequestDto {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
}

export interface UpdateShoppingItemRequestDto {
  name?: string;
  quantity?: string;
  unit?: string;
  notes?: string;
}

export interface CopyShoppingItemRequestDto {
  targetListId: string;
}
