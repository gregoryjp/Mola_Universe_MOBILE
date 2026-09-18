import { TimelineRow } from '@presentation/components/ui/TimelineRow';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { act, create } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

interface Options {
  time?: string;
  title?: string;
  meta?: string;
  isLast?: boolean;
  onPress?: () => void;
}

const render = (options: Options = {}): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <TimelineRow
        time={options.time ?? '10:00'}
        title={options.title ?? 'Sacar la basura'}
        meta={options.meta}
        isLast={options.isLast}
        onPress={options.onPress}
        testID="entry"
      />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const node = (renderer: ReactTestRenderer): ReactTestInstance => {
  const found = renderer.root.findAll(
    (n) => typeof n.type === 'string' && n.props.testID === 'entry',
  )[0];
  if (!found) throw new Error('entry not rendered');
  return found;
};

describe('TimelineRow', () => {
  it('reads as one day: time, title and kind, in that order', () => {
    const renderer = render({ meta: 'Cita' });
    const text = collectText(renderer.toJSON());

    expect(text).toContain('10:00');
    expect(text).toContain('Sacar la basura');
    expect(text).toContain('Cita');

    renderer.unmount();
  });

  it('omits the kind when the event has none worth showing', () => {
    const renderer = render();

    expect(collectText(renderer.toJSON()).trim()).toBe('10:00Sacar la basura');

    renderer.unmount();
  });

  it('puts the time in the accessible label, so position carries nothing alone', () => {
    const renderer = render({ meta: 'Cita', onPress: vi.fn() });

    expect(node(renderer).props.accessibilityLabel).toBe('10:00, Sacar la basura, Cita');

    renderer.unmount();
  });

  it('drops the trailing kind from the accessible label when there is none', () => {
    const renderer = render({ onPress: vi.fn() });

    expect(node(renderer).props.accessibilityLabel).toBe('10:00, Sacar la basura');

    renderer.unmount();
  });

  it('is a plain row when it has nowhere to go', () => {
    const renderer = render();
    const entry = node(renderer);

    expect(entry.props.onPress).toBeUndefined();
    expect(entry.props.accessibilityRole).toBeUndefined();

    renderer.unmount();
  });

  it('opens the event when it does have a destination', () => {
    const onPress = vi.fn();
    const renderer = render({ onPress });

    act(() => {
      node(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(node(renderer).props.accessibilityRole).toBe('button');

    renderer.unmount();
  });

  it('renders both a closing and a continuing entry without a mode flag leaking out', () => {
    const last = render({ isLast: true });
    const middle = render({ isLast: false });

    expect(collectText(last.toJSON())).toContain('Sacar la basura');
    expect(collectText(middle.toJSON())).toContain('Sacar la basura');

    last.unmount();
    middle.unmount();
  });
});
