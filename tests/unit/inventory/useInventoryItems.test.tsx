import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listPersonalItems: vi.fn(),
  listHouseholdItems: vi.fn(),
}));

vi.mock('@data/inventory/repositories/InventoryRepositoryImpl', () => ({
  inventoryRepository: {
    listPersonalItems: mocks.listPersonalItems,
    listHouseholdItems: mocks.listHouseholdItems,
  },
}));

import type { PaginatedInventoryItems } from '@domain/inventory/repositories/InventoryRepository';
import { useInventoryItems } from '@presentation/inventory/hooks/useInventoryItems';
import { useHouseholdStore } from '@shared/store/householdStore';

const page: PaginatedInventoryItems = {
  items: [
    {
      id: 'it1',
      createdBy: 'u1',
      scope: 'PERSONAL',
      householdId: null,
      name: 'Arroz',
      quantity: '5',
      unit: 'kg',
      lowThreshold: null,
      expiresAt: null,
      status: 'AVAILABLE',
      archivedAt: null,
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

let captured: ReturnType<typeof useInventoryItems> | undefined;
const Harness = (): null => {
  captured = useInventoryItems();
  return null;
};

const render = async (): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('useInventoryItems', () => {
  it('loads personal items when no household is active', async () => {
    mocks.listPersonalItems.mockResolvedValueOnce({ success: true, value: page });

    const renderer = await render();

    expect(mocks.listPersonalItems).toHaveBeenCalled();
    expect(mocks.listHouseholdItems).not.toHaveBeenCalled();
    expect(captured?.items).toHaveLength(1);

    renderer.unmount();
  });

  it('loads household items when a household is active', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listHouseholdItems.mockResolvedValueOnce({ success: true, value: page });

    const renderer = await render();

    expect(mocks.listHouseholdItems).toHaveBeenCalledWith('h1', { page: 1 });
    expect(mocks.listPersonalItems).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    mocks.listPersonalItems.mockResolvedValueOnce({
      success: false,
      error: { code: 'ITEM_NOT_FOUND', message: 'Item not found', statusCode: 404 },
    });

    const renderer = await render();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('ITEM_NOT_FOUND');

    renderer.unmount();
  });
});
