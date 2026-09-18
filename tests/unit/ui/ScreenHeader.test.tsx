import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { ScreenHeader } from '@presentation/components/ui/ScreenHeader';

const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const render = (props: {
  title: string;
  onBack?: () => void;
}): { renderer: ReactTestRenderer; press: (label: string) => boolean } => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<ScreenHeader {...props} testID="header" />);
  });
  if (!renderer) throw new Error('renderer not created');

  const press = (label: string): boolean => {
    const target: ReactTestInstance | undefined = renderer?.root.findAll(
      (node) => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
    )[0];
    if (!target) return false;
    act(() => {
      target.props.onPress();
    });
    return true;
  };

  return { renderer, press };
};

describe('ScreenHeader', () => {
  it('renders the section title', () => {
    const { renderer } = render({ title: 'Inventario' });

    expect(collectText(renderer.toJSON())).toContain('Inventario');

    renderer.unmount();
  });

  it('offers no way back on a screen that is not pushed', () => {
    const { renderer, press } = render({ title: 'Inventario' });

    expect(press('Volver')).toBe(false);

    renderer.unmount();
  });

  it('announces the back affordance when the screen has somewhere to return to', () => {
    const onBack = vi.fn();
    const { renderer, press } = render({ title: 'Inventario', onBack });

    expect(press('Volver')).toBe(true);
    expect(onBack).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });
});
