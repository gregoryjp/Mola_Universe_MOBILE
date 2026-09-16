import { describe, expect, it } from 'vitest';
import {
  toCreatedShoppingItem,
  toDuplicateGroup,
  toPaginatedShoppingLists,
  toShoppingItem,
  toShoppingList,
} from '@data/shopping/mappers/shoppingMappers';

describe('shoppingMappers', () => {
  it('normalises optional ShoppingList fields to null', () => {
    const list = toShoppingList({
      id: 'l1',
      createdBy: 'u1',
      scope: 'HOUSEHOLD',
      name: 'Casa',
      status: 'OPEN',
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    });

    expect(list.householdId).toBeNull();
    expect(list.notes).toBeNull();
    expect(list.completedAt).toBeNull();
    expect(list.scope).toBe('HOUSEHOLD');
  });

  it('normalises optional ShoppingItem fields to null', () => {
    const item = toShoppingItem({
      id: 'i1',
      listId: 'l1',
      addedBy: 'u1',
      name: 'Leche',
      quantity: '2',
      unit: 'l',
      status: 'PENDING',
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    });

    expect(item.notes).toBeNull();
    expect(item.purchasedBy).toBeNull();
    expect(item.purchasedAt).toBeNull();
    expect(item.copiedFromItemId).toBeNull();
  });

  it('maps the pagination envelope', () => {
    const page = toPaginatedShoppingLists({
      lists: [
        {
          id: 'l1',
          createdBy: 'u1',
          scope: 'PERSONAL',
          name: 'Semana',
          status: 'OPEN',
          createdAt: '2026-09-15T00:00:00.000Z',
          updatedAt: '2026-09-15T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 3,
      limit: 10,
    });

    expect(page.lists).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.page).toBe(3);
    expect(page.limit).toBe(10);
  });

  it('maps the created item with its duplicate suggestions', () => {
    const created = toCreatedShoppingItem({
      item: {
        id: 'i1',
        listId: 'l1',
        addedBy: 'u1',
        name: 'Leche',
        quantity: '2',
        unit: 'l',
        status: 'PENDING',
        createdAt: '2026-09-15T00:00:00.000Z',
        updatedAt: '2026-09-15T00:00:00.000Z',
      },
      duplicateSuggestions: [
        {
          id: 'i2',
          listId: 'l1',
          addedBy: 'u1',
          name: 'Leche',
          quantity: '1',
          unit: 'l',
          status: 'PENDING',
          createdAt: '2026-09-15T00:00:00.000Z',
          updatedAt: '2026-09-15T00:00:00.000Z',
        },
      ],
    });

    expect(created.item.id).toBe('i1');
    expect(created.duplicateSuggestions).toHaveLength(1);
    expect(created.duplicateSuggestions[0]?.id).toBe('i2');
  });

  it('maps duplicate groups', () => {
    const group = toDuplicateGroup({
      normalizedName: 'leche',
      normalizedUnit: 'l',
      items: [],
    });

    expect(group.normalizedName).toBe('leche');
    expect(group.normalizedUnit).toBe('l');
    expect(group.items).toEqual([]);
  });
});
