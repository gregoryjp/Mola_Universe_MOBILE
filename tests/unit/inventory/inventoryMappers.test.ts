import { describe, expect, it } from 'vitest';
import {
  toInventoryItem,
  toInventoryMovement,
  toMovementResult,
  toPaginatedInventoryItems,
} from '@data/inventory/mappers/inventoryMappers';

describe('inventoryMappers', () => {
  it('normalises optional InventoryItem fields to null', () => {
    const item = toInventoryItem({
      id: 'it1',
      createdBy: 'u1',
      scope: 'HOUSEHOLD',
      name: 'Arroz',
      quantity: '5',
      unit: 'kg',
      status: 'AVAILABLE',
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    });

    expect(item.householdId).toBeNull();
    expect(item.lowThreshold).toBeNull();
    expect(item.expiresAt).toBeNull();
    expect(item.archivedAt).toBeNull();
    expect(item.scope).toBe('HOUSEHOLD');
  });

  it('normalises optional InventoryMovement fields to null', () => {
    const movement = toInventoryMovement({
      id: 'm1',
      itemId: 'it1',
      createdBy: 'u1',
      type: 'ADD',
      quantityDelta: '5',
      balanceAfter: '5',
      createdAt: '2026-09-15T00:00:00.000Z',
    });

    expect(movement.reason).toBeNull();
    expect(movement.reversalOfId).toBeNull();
    expect(movement.type).toBe('ADD');
  });

  it('maps a movement result with its embedded item and status transition', () => {
    const result = toMovementResult({
      movement: {
        id: 'm1',
        itemId: 'it1',
        createdBy: 'u1',
        type: 'CONSUME',
        quantityDelta: '-4',
        balanceAfter: '1',
        createdAt: '2026-09-15T00:00:00.000Z',
      },
      item: {
        id: 'it1',
        createdBy: 'u1',
        scope: 'PERSONAL',
        name: 'Arroz',
        quantity: '1',
        unit: 'kg',
        status: 'LOW',
        createdAt: '2026-09-15T00:00:00.000Z',
        updatedAt: '2026-09-15T00:00:00.000Z',
      },
      statusChanged: true,
      previousStatus: 'AVAILABLE',
      newStatus: 'LOW',
    });

    expect(result.movement.quantityDelta).toBe('-4');
    expect(result.item.status).toBe('LOW');
    expect(result.statusChanged).toBe(true);
    expect(result.previousStatus).toBe('AVAILABLE');
    expect(result.newStatus).toBe('LOW');
  });

  it('maps the pagination envelope', () => {
    const page = toPaginatedInventoryItems({
      items: [
        {
          id: 'it1',
          createdBy: 'u1',
          scope: 'PERSONAL',
          name: 'Arroz',
          quantity: '5',
          unit: 'kg',
          status: 'AVAILABLE',
          createdAt: '2026-09-15T00:00:00.000Z',
          updatedAt: '2026-09-15T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 2,
      limit: 10,
    });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.page).toBe(2);
    expect(page.limit).toBe(10);
  });
});
