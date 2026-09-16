import type {
  CreateInventoryItemInput,
  CreateMovementInput,
  InventoryItem,
  InventoryMovement,
  MovementResult,
  UpdateInventoryItemInput,
} from '../entities/InventoryItem';

export interface InventoryError {
  code: string;
  message: string;
  statusCode: number;
}

export type InventoryResult<T> =
  | { success: true; value: T }
  | { success: false; error: InventoryError };

export interface PaginatedInventoryItems {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
}

/**
 * Inventory port. Movement routes carry no scope prefix — authorization is
 * resolved from the parent item (modules/inventory/routes/inventoryRoutes.ts).
 */
export interface InventoryRepository {
  listPersonalItems(params?: PageParams): Promise<InventoryResult<PaginatedInventoryItems>>;
  getItem(itemId: string): Promise<InventoryResult<InventoryItem>>;
  createPersonalItem(input: CreateInventoryItemInput): Promise<InventoryResult<InventoryItem>>;
  updateItem(
    itemId: string,
    input: UpdateInventoryItemInput,
  ): Promise<InventoryResult<InventoryItem>>;
  archiveItem(itemId: string): Promise<InventoryResult<void>>;
  listHouseholdItems(
    householdId: string,
    params?: PageParams,
  ): Promise<InventoryResult<PaginatedInventoryItems>>;
  createHouseholdItem(
    householdId: string,
    input: CreateInventoryItemInput,
  ): Promise<InventoryResult<InventoryItem>>;

  createMovement(
    itemId: string,
    input: CreateMovementInput,
  ): Promise<InventoryResult<MovementResult>>;
  listMovements(itemId: string): Promise<InventoryResult<InventoryMovement[]>>;
  reverseMovement(
    itemId: string,
    movementId: string,
    reason?: string,
  ): Promise<InventoryResult<MovementResult>>;
}
