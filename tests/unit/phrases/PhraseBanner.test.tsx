import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({ usePhrase: vi.fn() }));

vi.mock('@presentation/phrases/hooks/usePhrase', () => ({ usePhrase: mocks.usePhrase }));

import type { Phrase } from '@domain/phrases/entities/Phrase';
import { PhraseBanner } from '@presentation/phrases/components/PhraseBanner';

const render = (node: React.ReactElement): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(node);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

/** Flattens every string child of the tree, so split text nodes still match. */
const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const phrase = (module: Phrase['module'], text: string): Phrase => ({
  module,
  context: 'DAY_START',
  text,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PhraseBanner', () => {
  it('renders the text of the phrase', () => {
    mocks.usePhrase.mockReturnValue({
      phrase: phrase('TASKS', 'Hoy tienes tareas esperando. Vamos paso a paso.'),
    });

    const renderer = render(<PhraseBanner module="TASKS" context="DAY_START" />);

    expect(collectText(renderer.toJSON())).toContain('Hoy tienes tareas esperando.');
  });

  it('asks the bank for the module and context it was given', () => {
    mocks.usePhrase.mockReturnValue({ phrase: null });

    render(<PhraseBanner module="SAVINGS" context="DAY_START" />);

    expect(mocks.usePhrase).toHaveBeenCalledWith('SAVINGS', 'DAY_START');
  });

  it('renders nothing while the phrase is loading', () => {
    mocks.usePhrase.mockReturnValue({ phrase: null, isLoading: true });

    const renderer = render(<PhraseBanner module="TASKS" context="DAY_START" />);

    expect(renderer.toJSON()).toBeNull();
  });

  it('renders nothing when the bank is unreachable, instead of an error box', () => {
    mocks.usePhrase.mockReturnValue({
      phrase: null,
      isError: true,
      error: { code: 'NETWORK_ERROR', message: 'Network request failed', statusCode: 0 },
    });

    const renderer = render(<PhraseBanner module="SAVINGS" context="DAY_START" />);

    expect(renderer.toJSON()).toBeNull();
  });

  it('forwards testID so a screen test can find it', () => {
    mocks.usePhrase.mockReturnValue({ phrase: phrase('TASKS', 'Vamos paso a paso.') });

    const renderer = render(
      <PhraseBanner module="TASKS" context="DAY_START" testID="tasks-phrase" />,
    );

    expect(renderer.root.findByProps({ testID: 'tasks-phrase' })).toBeTruthy();
  });
});
