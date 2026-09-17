import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  listPersonalLists: vi.fn(),
  listHouseholdLists: vi.fn(),
}));

vi.mock('@data/shopping/repositories/ShoppingRepositoryImpl', () => ({
  shoppingRepository: {
    listPersonalLists: mocks.listPersonalLists,
    listHouseholdLists: mocks.listHouseholdLists,
  },
}));

import type { PaginatedShoppingLists } from '@domain/shopping/repositories/ShoppingRepository';
import { useShoppingLists } from '@presentation/shopping/hooks/useShoppingLists';
import { useHouseholdStore } from '@shared/store/householdStore';

const page: PaginatedShoppingLists = {
  lists: [
    {
      id: 'l1',
      createdBy: 'u1',
      scope: 'PERSONAL',
      householdId: null,
      name: 'Semana',
      notes: null,
      status: 'OPEN',
      completedAt: null,
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

let captured: ReturnType<typeof useShoppingLists> | undefined;
const Harness = (): null => {
  captured = useShoppingLists();
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
    await flushQueries();
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
  useHouseholdStore.setState({ activeHouseholdId: null });
});

describe('useShoppingLists', () => {
  it('loads personal lists when no household is active', async () => {
    mocks.listPersonalLists.mockResolvedValueOnce({ success: true, value: page });

    const renderer = await render();

    expect(mocks.listPersonalLists).toHaveBeenCalled();
    expect(mocks.listHouseholdLists).not.toHaveBeenCalled();
    expect(captured?.lists).toHaveLength(1);

    renderer.unmount();
  });

  it('loads household lists when a household is active', async () => {
    useHouseholdStore.setState({ activeHouseholdId: 'h1' });
    mocks.listHouseholdLists.mockResolvedValueOnce({ success: true, value: page });

    const renderer = await render();

    expect(mocks.listHouseholdLists).toHaveBeenCalledWith('h1', { page: 1 });
    expect(mocks.listPersonalLists).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    mocks.listPersonalLists.mockResolvedValueOnce({
      success: false,
      error: { code: 'SHOPPING_LIST_NOT_FOUND', message: 'List not found', statusCode: 404 },
    });

    const renderer = await render();

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('SHOPPING_LIST_NOT_FOUND');

    renderer.unmount();
  });
});
