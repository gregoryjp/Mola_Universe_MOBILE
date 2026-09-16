export type InventoryScope = 'PERSONAL' | 'HOUSEHOLD';

export type InventoryStatus =
  | 'AVAILABLE'
  | 'LOW'
  | 'OUT_OF_STOCK'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'ARCHIVED';

/** `REVERSAL` is server-generated; clients only send ADD/CONSUME/ADJUST. */
export type InventoryMovementType = 'ADD' | 'CONSUME' | 'ADJUST' | 'REVERSAL';

export type MovementInputType = 'ADD' | 'CONSUME' | 'ADJUST';

/** Mirrors the backend `IInventoryItemDTO` (modules/inventory/interface/IInventory.ts). */
export interface InventoryItem {
  id: string;
  createdBy: string;
  scope: InventoryScope;
  householdId: string | null;
  name: string;
  quantity: string;
  unit: string;
  lowThreshold: string | null;
  expiresAt: string | null;
  status: InventoryStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  createdBy: string;
  type: InventoryMovementType;
  quantityDelta: string;
  balanceAfter: string;
  reason: string | null;
  reversalOfId: string | null;
  createdAt: string;
}

/** Response of creating/reversing a movement (backend `IMovementResultDTO`). */
export interface MovementResult {
  movement: InventoryMovement;
  item: InventoryItem;
  statusChanged: boolean;
  previousStatus: InventoryStatus;
  newStatus: InventoryStatus;
}

export interface CreateInventoryItemInput {
  name: string;
  unit: string;
  lowThreshold?: string;
  expiresAt?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  unit?: string;
  lowThreshold?: string;
  expiresAt?: string | null;
}

export interface CreateMovementInput {
  type: MovementInputType;
  quantity: string;
  unit: string;
  reason?: string;
}
