import { colors } from '@core/theme/colors';
import { NavRow } from '@presentation/components/ui/NavRow';
import { PawPrint } from 'lucide-react-native';
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
  label?: string;
  hint?: string;
  meta?: string;
  onPress?: () => void;
}

const render = (options: Options = {}): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <NavRow
        icon={PawPrint}
        label={options.label ?? 'Mascotas'}
        hint={options.hint}
        meta={options.meta}
        onPress={options.onPress ?? vi.fn()}
        testID="row"
      />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const button = (renderer: ReactTestRenderer): ReactTestInstance => {
  const node = renderer.root.findAll(
    (n) =>
      typeof n.type === 'string' &&
      n.props.testID === 'row' &&
      typeof n.props.onPress === 'function',
  )[0];
  if (!node) throw new Error('row is not pressable');
  return node;
};

describe('NavRow', () => {
  it('shows the label and the one-line hint that says what it does', () => {
    const renderer = render({ hint: 'Añadir una mascota a casa' });

    expect(collectText(renderer.toJSON())).toContain('Mascotas');
    expect(collectText(renderer.toJSON())).toContain('Añadir una mascota a casa');

    renderer.unmount();
  });

  it('omits the hint line when there is nothing to explain', () => {
    const renderer = render();
    const text = collectText(renderer.toJSON());

    expect(text).toContain('Mascotas');
    expect(text.trim()).toBe('Mascotas');

    renderer.unmount();
  });

  it('renders the optional counter on the right', () => {
    const renderer = render({ meta: '3' });

    expect(collectText(renderer.toJSON())).toContain('3');

    renderer.unmount();
  });

  it('announces the label, and lets a caller override it', () => {
    const defaultLabelled = render();
    expect(button(defaultLabelled).props.accessibilityLabel).toBe('Mascotas');
    defaultLabelled.unmount();

    let withOverride: ReactTestRenderer | undefined;
    act(() => {
      withOverride = create(
        <NavRow
          icon={PawPrint}
          label="Mascotas"
          accessibilityLabel="Mascotas, 3 pendientes"
          onPress={vi.fn()}
          testID="row"
        />,
      );
    });
    if (!withOverride) throw new Error('renderer not created');
    expect(button(withOverride).props.accessibilityLabel).toBe('Mascotas, 3 pendientes');
    withOverride.unmount();
  });

  it('is a button, not a decorative row', () => {
    const renderer = render();

    expect(button(renderer).props.accessibilityRole).toBe('button');

    renderer.unmount();
  });

  it('calls onPress once when tapped', () => {
    const onPress = vi.fn();
    const renderer = render({ onPress });

    act(() => {
      button(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('draws the icon in the theme ink, so no module owns a colour', () => {
    const renderer = render();

    // The tile is `primarySoft`; a pastel icon on it fails the 3:1 non-text
    // minimum (TD-040), so the ink must stay the neutral `text` token.
    const icon = renderer.root.findAll((n) => typeof n.props.color === 'string')[0];
    expect(icon?.props.color).toBe(colors.light.text);

    renderer.unmount();
  });
});
