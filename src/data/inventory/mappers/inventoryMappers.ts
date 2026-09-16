import type {
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  InventoryScope,
  InventoryStatus,
  MovementResult,
} from '@domain/inventory/entities/InventoryItem';
import type { PaginatedInventoryItems } from '@domain/inventory/repositories/InventoryRepository';
import type {
  InventoryItemDto,
  InventoryMovementDto,
  MovementResultDto,
  PaginatedInventoryItemsDto,
} from '../dtos/inventoryDtos';

export const toInventoryItem = (dto: InventoryItemDto): InventoryItem => ({
  id: dto.id,
  createdBy: dto.createdBy,
  scope: dto.scope as InventoryScope,
  householdId: dto.householdId ?? null,
  name: dto.name,
  quantity: dto.quantity,
  unit: dto.unit,
  lowThreshold: dto.lowThreshold ?? null,
  expiresAt: dto.expiresAt ?? null,
  status: dto.status as InventoryStatus,
  archivedAt: dto.archivedAt ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toInventoryMovement = (dto: InventoryMovementDto): InventoryMovement => ({
  id: dto.id,
  itemId: dto.itemId,
  createdBy: dto.createdBy,
  type: dto.type as InventoryMovementType,
  quantityDelta: dto.quantityDelta,
  balanceAfter: dto.balanceAfter,
  reason: dto.reason ?? null,
  reversalOfId: dto.reversalOfId ?? null,
  createdAt: dto.createdAt,
});

export const toMovementResult = (dto: MovementResultDto): MovementResult => ({
  movement: toInventoryMovement(dto.movement),
  item: toInventoryItem(dto.item),
  statusChanged: dto.statusChanged,
  previousStatus: dto.previousStatus as InventoryStatus,
  newStatus: dto.newStatus as InventoryStatus,
});

export const toPaginatedInventoryItems = (
  dto: PaginatedInventoryItemsDto,
): PaginatedInventoryItems => ({
  items: dto.items.map(toInventoryItem),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
});
