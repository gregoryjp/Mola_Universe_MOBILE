// Mirrors the backend inventory payloads (modules/inventory/interface/IInventory.ts).

export interface InventoryItemDto {
  id: string;
  createdBy: string;
  scope: 'PERSONAL' | 'HOUSEHOLD';
  householdId?: string | null;
  name: string;
  quantity: string;
  unit: string;
  lowThreshold?: string | null;
  expiresAt?: string | null;
  status: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovementDto {
  id: string;
  itemId: string;
  createdBy: string;
  type: string;
  quantityDelta: string;
  balanceAfter: string;
  reason?: string | null;
  reversalOfId?: string | null;
  createdAt: string;
}

export interface MovementResultDto {
  movement: InventoryMovementDto;
  item: InventoryItemDto;
  statusChanged: boolean;
  previousStatus: string;
  newStatus: string;
}

export interface PaginatedInventoryItemsDto {
  items: InventoryItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateInventoryItemRequestDto {
  name: string;
  unit: string;
  lowThreshold?: string;
  expiresAt?: string;
}

export interface UpdateInventoryItemRequestDto {
  name?: string;
  unit?: string;
  lowThreshold?: string;
  expiresAt?: string | null;
}

export interface CreateMovementRequestDto {
  type: 'ADD' | 'CONSUME' | 'ADJUST';
  quantity: string;
  unit: string;
  reason?: string;
}

export interface ReverseMovementRequestDto {
  reason?: string;
}
