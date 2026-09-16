import type {
  CreatedShoppingItem,
  CreateShoppingItemInput,
  CreateShoppingListInput,
  DuplicateGroup,
  ShoppingItem,
  ShoppingList,
  UpdateShoppingItemInput,
} from '../entities/ShoppingList';

export interface ShoppingError {
  code: string;
  message: string;
  statusCode: number;
}

export type ShoppingResult<T> =
  | { success: true; value: T }
  | { success: false; error: ShoppingError };

export interface PaginatedShoppingLists {
  lists: ShoppingList[];
  total: number;
  page: number;
  limit: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
}

/**
 * Shopping port. Item routes carry no scope prefix — authorization is resolved
 * from the parent list (verified in modules/shopping/routes/shoppingRoutes.ts).
 */
export interface ShoppingRepository {
  listPersonalLists(params?: PageParams): Promise<ShoppingResult<PaginatedShoppingLists>>;
  getList(listId: string): Promise<ShoppingResult<ShoppingList>>;
  createPersonalList(input: CreateShoppingListInput): Promise<ShoppingResult<ShoppingList>>;
  deleteList(listId: string): Promise<ShoppingResult<void>>;
  listHouseholdLists(
    householdId: string,
    params?: PageParams,
  ): Promise<ShoppingResult<PaginatedShoppingLists>>;
  createHouseholdList(
    householdId: string,
    input: CreateShoppingListInput,
  ): Promise<ShoppingResult<ShoppingList>>;

  listItems(listId: string): Promise<ShoppingResult<ShoppingItem[]>>;
  addItem(
    listId: string,
    input: CreateShoppingItemInput,
  ): Promise<ShoppingResult<CreatedShoppingItem>>;
  updateItem(
    listId: string,
    itemId: string,
    input: UpdateShoppingItemInput,
  ): Promise<ShoppingResult<ShoppingItem>>;
  purchaseItem(listId: string, itemId: string): Promise<ShoppingResult<ShoppingItem>>;
  cancelItem(listId: string, itemId: string): Promise<ShoppingResult<ShoppingItem>>;
  reopenItem(listId: string, itemId: string): Promise<ShoppingResult<ShoppingItem>>;
  deleteItem(listId: string, itemId: string): Promise<ShoppingResult<void>>;
  copyItem(
    listId: string,
    itemId: string,
    targetListId: string,
  ): Promise<ShoppingResult<ShoppingItem>>;
  getDuplicates(listId: string): Promise<ShoppingResult<DuplicateGroup[]>>;
}
