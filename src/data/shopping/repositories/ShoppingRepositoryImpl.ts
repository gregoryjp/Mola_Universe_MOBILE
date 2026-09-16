import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreatedShoppingItem,
  CreateShoppingItemInput,
  CreateShoppingListInput,
  DuplicateGroup,
  ShoppingItem,
  ShoppingList,
  UpdateShoppingItemInput,
} from '@domain/shopping/entities/ShoppingList';
import type {
  PageParams,
  PaginatedShoppingLists,
  ShoppingRepository,
  ShoppingResult,
} from '@domain/shopping/repositories/ShoppingRepository';
import type {
  CopyShoppingItemRequestDto,
  CreatedShoppingItemDto,
  CreateShoppingItemRequestDto,
  CreateShoppingListRequestDto,
  DuplicateGroupDto,
  PaginatedShoppingListsDto,
  ShoppingItemDto,
  ShoppingListDto,
  UpdateShoppingItemRequestDto,
} from '../dtos/shoppingDtos';
import {
  toCreatedShoppingItem,
  toDuplicateGroup,
  toPaginatedShoppingLists,
  toShoppingItem,
  toShoppingList,
} from '../mappers/shoppingMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): ShoppingResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const queryString = (params?: PageParams): string => {
  if (!params) return '';
  const parts: string[] = [];
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

const emptyOk = (): ShoppingResult<void> => ({ success: true, value: undefined });

export class ShoppingRepositoryImpl implements ShoppingRepository {
  async listPersonalLists(params?: PageParams): Promise<ShoppingResult<PaginatedShoppingLists>> {
    const raw = await apiClient.getRaw<PaginatedShoppingListsDto>(
      `/users/shopping-lists${queryString(params)}`,
    );
    return toResult(raw, toPaginatedShoppingLists);
  }

  async getList(listId: string): Promise<ShoppingResult<ShoppingList>> {
    const raw = await apiClient.getRaw<ShoppingListDto>(`/users/shopping-lists/${listId}`);
    return toResult(raw, toShoppingList);
  }

  async createPersonalList(input: CreateShoppingListInput): Promise<ShoppingResult<ShoppingList>> {
    const body: CreateShoppingListRequestDto = { ...input };
    const raw = await apiClient.postRaw<ShoppingListDto>('/users/shopping-lists', body);
    return toResult(raw, toShoppingList);
  }

  async deleteList(listId: string): Promise<ShoppingResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/users/shopping-lists/${listId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }

  async listHouseholdLists(
    householdId: string,
    params?: PageParams,
  ): Promise<ShoppingResult<PaginatedShoppingLists>> {
    const raw = await apiClient.getRaw<PaginatedShoppingListsDto>(
      `/households/${householdId}/shopping-lists${queryString(params)}`,
    );
    return toResult(raw, toPaginatedShoppingLists);
  }

  async createHouseholdList(
    householdId: string,
    input: CreateShoppingListInput,
  ): Promise<ShoppingResult<ShoppingList>> {
    const body: CreateShoppingListRequestDto = { ...input };
    const raw = await apiClient.postRaw<ShoppingListDto>(
      `/households/${householdId}/shopping-lists`,
      body,
    );
    return toResult(raw, toShoppingList);
  }

  async listItems(listId: string): Promise<ShoppingResult<ShoppingItem[]>> {
    const raw = await apiClient.getRaw<ShoppingItemDto[]>(`/shopping-lists/${listId}/items`);
    return toResult(raw, (items) => items.map(toShoppingItem));
  }

  async addItem(
    listId: string,
    input: CreateShoppingItemInput,
  ): Promise<ShoppingResult<CreatedShoppingItem>> {
    const body: CreateShoppingItemRequestDto = { ...input };
    const raw = await apiClient.postRaw<CreatedShoppingItemDto>(
      `/shopping-lists/${listId}/items`,
      body,
    );
    return toResult(raw, toCreatedShoppingItem);
  }

  async updateItem(
    listId: string,
    itemId: string,
    input: UpdateShoppingItemInput,
  ): Promise<ShoppingResult<ShoppingItem>> {
    const body: UpdateShoppingItemRequestDto = { ...input };
    const raw = await apiClient.patchRaw<ShoppingItemDto>(
      `/shopping-lists/${listId}/items/${itemId}`,
      body,
    );
    return toResult(raw, toShoppingItem);
  }

  async purchaseItem(listId: string, itemId: string): Promise<ShoppingResult<ShoppingItem>> {
    const raw = await apiClient.patchRaw<ShoppingItemDto>(
      `/shopping-lists/${listId}/items/${itemId}/purchase`,
    );
    return toResult(raw, toShoppingItem);
  }

  async cancelItem(listId: string, itemId: string): Promise<ShoppingResult<ShoppingItem>> {
    const raw = await apiClient.patchRaw<ShoppingItemDto>(
      `/shopping-lists/${listId}/items/${itemId}/cancel`,
    );
    return toResult(raw, toShoppingItem);
  }

  async reopenItem(listId: string, itemId: string): Promise<ShoppingResult<ShoppingItem>> {
    const raw = await apiClient.patchRaw<ShoppingItemDto>(
      `/shopping-lists/${listId}/items/${itemId}/reopen`,
    );
    return toResult(raw, toShoppingItem);
  }

  async deleteItem(listId: string, itemId: string): Promise<ShoppingResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/shopping-lists/${listId}/items/${itemId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }

  async copyItem(
    listId: string,
    itemId: string,
    targetListId: string,
  ): Promise<ShoppingResult<ShoppingItem>> {
    const body: CopyShoppingItemRequestDto = { targetListId };
    const raw = await apiClient.postRaw<ShoppingItemDto>(
      `/shopping-lists/${listId}/items/${itemId}/copy`,
      body,
    );
    return toResult(raw, toShoppingItem);
  }

  async getDuplicates(listId: string): Promise<ShoppingResult<DuplicateGroup[]>> {
    const raw = await apiClient.getRaw<DuplicateGroupDto[]>(`/shopping-lists/${listId}/duplicates`);
    return toResult(raw, (groups) => groups.map(toDuplicateGroup));
  }
}

export const shoppingRepository: ShoppingRepository = new ShoppingRepositoryImpl();
