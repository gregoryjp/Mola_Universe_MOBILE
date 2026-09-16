import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreateInventoryItemInput,
  CreateMovementInput,
  InventoryItem,
  InventoryMovement,
  MovementResult,
  UpdateInventoryItemInput,
} from '@domain/inventory/entities/InventoryItem';
import type {
  InventoryRepository,
  InventoryResult,
  PageParams,
  PaginatedInventoryItems,
} from '@domain/inventory/repositories/InventoryRepository';
import type {
  CreateInventoryItemRequestDto,
  CreateMovementRequestDto,
  InventoryItemDto,
  InventoryMovementDto,
  MovementResultDto,
  PaginatedInventoryItemsDto,
  ReverseMovementRequestDto,
  UpdateInventoryItemRequestDto,
} from '../dtos/inventoryDtos';
import {
  toInventoryItem,
  toInventoryMovement,
  toMovementResult,
  toPaginatedInventoryItems,
} from '../mappers/inventoryMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): InventoryResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const queryString = (params?: PageParams): string => {
  if (!params) return '';
  const parts: string[] = [];
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

export class InventoryRepositoryImpl implements InventoryRepository {
  async listPersonalItems(params?: PageParams): Promise<InventoryResult<PaginatedInventoryItems>> {
    const raw = await apiClient.getRaw<PaginatedInventoryItemsDto>(
      `/users/inventory-items${queryString(params)}`,
    );
    return toResult(raw, toPaginatedInventoryItems);
  }

  async getItem(itemId: string): Promise<InventoryResult<InventoryItem>> {
    const raw = await apiClient.getRaw<InventoryItemDto>(`/users/inventory-items/${itemId}`);
    return toResult(raw, toInventoryItem);
  }

  async createPersonalItem(
    input: CreateInventoryItemInput,
  ): Promise<InventoryResult<InventoryItem>> {
    const body: CreateInventoryItemRequestDto = { ...input };
    const raw = await apiClient.postRaw<InventoryItemDto>('/users/inventory-items', body);
    return toResult(raw, toInventoryItem);
  }

  async updateItem(
    itemId: string,
    input: UpdateInventoryItemInput,
  ): Promise<InventoryResult<InventoryItem>> {
    const body: UpdateInventoryItemRequestDto = { ...input };
    const raw = await apiClient.patchRaw<InventoryItemDto>(
      `/users/inventory-items/${itemId}`,
      body,
    );
    return toResult(raw, toInventoryItem);
  }

  async archiveItem(itemId: string): Promise<InventoryResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`/users/inventory-items/${itemId}`);
    return raw.success
      ? { success: true, value: undefined }
      : { success: false, error: toError(raw) };
  }

  async listHouseholdItems(
    householdId: string,
    params?: PageParams,
  ): Promise<InventoryResult<PaginatedInventoryItems>> {
    const raw = await apiClient.getRaw<PaginatedInventoryItemsDto>(
      `/households/${householdId}/inventory-items${queryString(params)}`,
    );
    return toResult(raw, toPaginatedInventoryItems);
  }

  async createHouseholdItem(
    householdId: string,
    input: CreateInventoryItemInput,
  ): Promise<InventoryResult<InventoryItem>> {
    const body: CreateInventoryItemRequestDto = { ...input };
    const raw = await apiClient.postRaw<InventoryItemDto>(
      `/households/${householdId}/inventory-items`,
      body,
    );
    return toResult(raw, toInventoryItem);
  }

  async createMovement(
    itemId: string,
    input: CreateMovementInput,
  ): Promise<InventoryResult<MovementResult>> {
    const body: CreateMovementRequestDto = { ...input };
    const raw = await apiClient.postRaw<MovementResultDto>(
      `/inventory-items/${itemId}/movements`,
      body,
    );
    return toResult(raw, toMovementResult);
  }

  async listMovements(itemId: string): Promise<InventoryResult<InventoryMovement[]>> {
    const raw = await apiClient.getRaw<InventoryMovementDto[]>(
      `/inventory-items/${itemId}/movements`,
    );
    return toResult(raw, (movements) => movements.map(toInventoryMovement));
  }

  async reverseMovement(
    itemId: string,
    movementId: string,
    reason?: string,
  ): Promise<InventoryResult<MovementResult>> {
    const body: ReverseMovementRequestDto = reason ? { reason } : {};
    const raw = await apiClient.postRaw<MovementResultDto>(
      `/inventory-items/${itemId}/movements/${movementId}/reverse`,
      body,
    );
    return toResult(raw, toMovementResult);
  }
}

export const inventoryRepository: InventoryRepository = new InventoryRepositoryImpl();
