import type {
  CreatedShoppingItem,
  DuplicateGroup,
  ShoppingItem,
  ShoppingItemStatus,
  ShoppingList,
  ShoppingListStatus,
} from '@domain/shopping/entities/ShoppingList';
import type { PaginatedShoppingLists } from '@domain/shopping/repositories/ShoppingRepository';
import type {
  CreatedShoppingItemDto,
  DuplicateGroupDto,
  PaginatedShoppingListsDto,
  ShoppingItemDto,
  ShoppingListDto,
} from '../dtos/shoppingDtos';

export const toShoppingList = (dto: ShoppingListDto): ShoppingList => ({
  id: dto.id,
  createdBy: dto.createdBy,
  scope: dto.scope,
  householdId: dto.householdId ?? null,
  name: dto.name,
  notes: dto.notes ?? null,
  status: dto.status as ShoppingListStatus,
  completedAt: dto.completedAt ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toShoppingItem = (dto: ShoppingItemDto): ShoppingItem => ({
  id: dto.id,
  listId: dto.listId,
  addedBy: dto.addedBy,
  name: dto.name,
  quantity: dto.quantity,
  unit: dto.unit,
  notes: dto.notes ?? null,
  status: dto.status as ShoppingItemStatus,
  purchasedBy: dto.purchasedBy ?? null,
  purchasedAt: dto.purchasedAt ?? null,
  copiedFromItemId: dto.copiedFromItemId ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toPaginatedShoppingLists = (
  dto: PaginatedShoppingListsDto,
): PaginatedShoppingLists => ({
  lists: dto.lists.map(toShoppingList),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
});

export const toCreatedShoppingItem = (dto: CreatedShoppingItemDto): CreatedShoppingItem => ({
  item: toShoppingItem(dto.item),
  duplicateSuggestions: dto.duplicateSuggestions.map(toShoppingItem),
});

export const toDuplicateGroup = (dto: DuplicateGroupDto): DuplicateGroup => ({
  normalizedName: dto.normalizedName,
  normalizedUnit: dto.normalizedUnit,
  items: dto.items.map(toShoppingItem),
});
