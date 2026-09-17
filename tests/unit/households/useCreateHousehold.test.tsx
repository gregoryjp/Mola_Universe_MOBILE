import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({ createHousehold: vi.fn() }));

vi.mock('@data/households/repositories/HouseholdRepositoryImpl', () => ({
  householdRepository: { createHousehold: mocks.createHousehold },
}));

import type { Household } from '@domain/households/entities/Household';
import { useCreateHousehold } from '@presentation/households/hooks/useCreateHousehold';

const household: Household = {
  id: 'h1',
  name: 'Casa',
  description: null,
  ownerId: 'u1',
  memberCount: 1,
  createdAt: '2026-09-15T00:00:00.000Z',
};

let captured: ReturnType<typeof useCreateHousehold> | undefined;

const Harness = (): null => {
  captured = useCreateHousehold();
  return null;
};

const render = async (): Promise<ReactTestRenderer> => {
  const queryClient = new QueryClient();
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={queryClient}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  captured = undefined;
});

describe('useCreateHousehold', () => {
  it('creates a household and exposes the result', async () => {
    mocks.createHousehold.mockResolvedValueOnce({ success: true, value: household });

    const renderer = await render();

    await act(async () => {
      captured?.mutate({ name: 'Casa' });
    });
    await act(async () => {
      await flushQueries();
    });

    expect(mocks.createHousehold).toHaveBeenCalledWith({ name: 'Casa' });
    expect(captured?.isSuccess).toBe(true);
    expect(captured?.data?.id).toBe('h1');

    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    mocks.createHousehold.mockResolvedValueOnce({
      success: false,
      error: { code: 'MAX_HOUSEHOLDS', message: 'Max households reached', statusCode: 400 },
    });

    const renderer = await render();

    await act(async () => {
      captured?.mutate({ name: 'Casa' });
    });
    await act(async () => {
      await flushQueries();
    });

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('MAX_HOUSEHOLDS');

    renderer.unmount();
  });
});
