import type { MeowCapabilityResult } from '@domain/meow/entities/Meow';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({
  executeCapability: vi.fn(),
}));

vi.mock('@data/meow/repositories/MeowRepositoryImpl', () => ({
  meowRepository: { executeCapability: mocks.executeCapability },
}));

import { useMeowCapability } from '@presentation/meow/hooks/useMeowCapability';

const result = (capability: MeowCapabilityResult['capability']): MeowCapabilityResult => ({
  capability,
  message: 'Hecho.',
  data: {},
  phrase: null,
});

type Mutation = ReturnType<typeof useMeowCapability>;

const render = async (): Promise<{
  getMutation: () => Mutation;
  invalidateQueries: ReturnType<typeof vi.fn>;
  renderer: ReactTestRenderer;
}> => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  client.invalidateQueries = invalidateQueries;

  // A live reference: react-query re-renders the harness as the mutation
  // transitions, and a snapshot taken at mount time would stay `idle`.
  const latest: { current?: Mutation } = {};
  const Harness = (): null => {
    latest.current = useMeowCapability();
    return null;
  };

  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer || !latest.current) throw new Error('renderer not created');
  return { getMutation: () => latest.current as Mutation, invalidateQueries, renderer };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useMeowCapability', () => {
  it('returns the deterministic result of the capability', async () => {
    mocks.executeCapability.mockResolvedValue({ success: true, value: result('VIEW_MY_DAY') });
    const { getMutation, renderer } = await render();

    await act(async () => {
      getMutation().mutate({ capability: 'VIEW_MY_DAY', params: {} });
    });
    await flushQueries();

    expect(mocks.executeCapability).toHaveBeenCalledWith('VIEW_MY_DAY', {});
    expect(getMutation().data?.message).toBe('Hecho.');
    renderer.unmount();
  });

  it('refreshes the tasks cache when a capability writes a task', async () => {
    mocks.executeCapability.mockResolvedValue({ success: true, value: result('CREATE_TASK') });
    const { getMutation, invalidateQueries, renderer } = await render();

    await act(async () => {
      getMutation().mutate({ capability: 'CREATE_TASK', params: { title: 'Comprar pan' } });
    });
    await flushQueries();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
    renderer.unmount();
  });

  it('refreshes the calendar cache when a capability creates an event', async () => {
    mocks.executeCapability.mockResolvedValue({ success: true, value: result('CREATE_EVENT') });
    const { getMutation, invalidateQueries, renderer } = await render();

    await act(async () => {
      getMutation().mutate({ capability: 'CREATE_EVENT', params: { title: 'Cena' } });
    });
    await flushQueries();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar'] });
    renderer.unmount();
  });

  it('does not invalidate anything for a read-only capability', async () => {
    mocks.executeCapability.mockResolvedValue({ success: true, value: result('VIEW_INVENTORY') });
    const { getMutation, invalidateQueries, renderer } = await render();

    await act(async () => {
      getMutation().mutate({ capability: 'VIEW_INVENTORY', params: {} });
    });
    await flushQueries();

    expect(invalidateQueries).not.toHaveBeenCalled();
    renderer.unmount();
  });

  it('surfaces the backend error as a typed AppError', async () => {
    mocks.executeCapability.mockResolvedValue({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Faltan datos', statusCode: 400 },
    });
    const { getMutation, renderer } = await render();

    await act(async () => {
      getMutation().mutate({ capability: 'CREATE_TASK', params: {} });
    });
    await flushQueries();

    expect(getMutation().error?.code).toBe('INVALID_INPUT');
    expect(getMutation().error?.message).toBe('Faltan datos');
    renderer.unmount();
  });
});
