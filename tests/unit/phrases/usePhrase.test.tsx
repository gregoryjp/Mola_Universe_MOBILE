import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushQueries } from '../../helpers/flush';

const mocks = vi.hoisted(() => ({ getPhrase: vi.fn() }));

vi.mock('@data/phrases/repositories/PhraseRepositoryImpl', () => ({
  phraseRepository: { getPhrase: mocks.getPhrase },
}));

import { usePhrase } from '@presentation/phrases/hooks/usePhrase';

const withQueryClient = async (node: React.ReactElement): Promise<ReactTestRenderer> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
  });
  await act(async () => {
    await flushQueries();
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePhrase', () => {
  it('asks the bank for the module and context it was given', async () => {
    mocks.getPhrase.mockResolvedValue({
      success: true,
      value: { module: 'TASKS', context: 'DAY_START', text: 'Vamos paso a paso.' },
    });

    let captured: ReturnType<typeof usePhrase> | undefined;
    const Harness = (): null => {
      captured = usePhrase('TASKS', 'DAY_START');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(mocks.getPhrase).toHaveBeenCalledWith('TASKS', 'DAY_START');
    expect(captured?.phrase?.text).toBe('Vamos paso a paso.');
    expect(captured?.phrase?.module).toBe('TASKS');

    renderer.unmount();
  });

  it('exposes the phrase as null until it arrives', async () => {
    mocks.getPhrase.mockResolvedValue({
      success: true,
      value: { module: 'SAVINGS', context: 'DAY_START', text: 'Cada aporte cuenta.' },
    });

    let captured: ReturnType<typeof usePhrase> | undefined;
    const Harness = (): null => {
      captured = usePhrase('SAVINGS', 'DAY_START');
      return null;
    };

    // First render, before the promise resolves: the banner has nothing to show.
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <QueryClientProvider client={client}>
          <Harness />
        </QueryClientProvider>,
      );
    });

    expect(captured?.phrase).toBeNull();

    renderer?.unmount();
  });

  it('surfaces the backend error without inventing a phrase', async () => {
    mocks.getPhrase.mockResolvedValue({
      success: false,
      error: { code: 'PHRASE_NOT_FOUND', message: 'No phrase', statusCode: 404 },
    });

    let captured: ReturnType<typeof usePhrase> | undefined;
    const Harness = (): null => {
      captured = usePhrase('DIARY', 'RELAPSE');
      return null;
    };

    const renderer = await withQueryClient(<Harness />);

    expect(captured?.isError).toBe(true);
    expect(captured?.error?.code).toBe('PHRASE_NOT_FOUND');
    expect(captured?.phrase).toBeNull();

    renderer.unmount();
  });

  it('keys the cache by module and context so the two screens never collide', async () => {
    mocks.getPhrase.mockResolvedValue({
      success: true,
      value: { module: 'TASKS', context: 'DAY_START', text: 'Vamos paso a paso.' },
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Harness = (): null => {
      usePhrase('TASKS', 'DAY_START');
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
    await act(async () => {
      await flushQueries();
    });

    expect(client.getQueryData(['phrases', 'TASKS', 'DAY_START'])).toEqual({
      module: 'TASKS',
      context: 'DAY_START',
      text: 'Vamos paso a paso.',
    });

    renderer?.unmount();
  });
});
