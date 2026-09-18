import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { ValuePropsScreen } from '@presentation/auth/screens/ValuePropsScreen';

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const textOf = (renderer: ReactTestRenderer): string => collectText(renderer.toJSON());

/**
 * `findByProps` would also match the composite `Button` element, which carries
 * `testID` but none of the accessibility props the host receives. These tests
 * care about what actually reaches the host, so they filter on `typeof type ===
 * 'string'` (the stub renders host components as plain strings).
 */
const host = (renderer: ReactTestRenderer, testID: string): ReactTestInstance => {
  const matches = renderer.root.findAll(
    (node) => typeof node.type === 'string' && node.props.testID === testID,
  );
  if (matches.length !== 1) {
    throw new Error(`expected exactly one host with testID "${testID}", found ${matches.length}`);
  }
  return matches[0] as ReactTestInstance;
};

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<ValuePropsScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const press = (renderer: ReactTestRenderer, testID: string): void => {
  act(() => {
    host(renderer, testID).props.onPress();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ValuePropsScreen — the single entry point', () => {
  it('carries the promise in the headline, split into the two lines of the mockup', () => {
    const text = textOf(render());

    expect(text).toContain('Tu universo familiar,');
    expect(text).toContain('en un solo lugar');
  });

  it('keeps the supporting line about what MOLA organises', () => {
    expect(textOf(render())).toContain('Organiza tareas, cuida a los tuyos');
  });

  it('reads brand → action → secondary, in that order', () => {
    const text = textOf(render());

    const headline = text.indexOf('Tu universo familiar,');
    const cta = text.indexOf('Comenzar');
    const secondary = text.indexOf('¿Ya tienes una cuenta?');

    expect(headline).toBeGreaterThanOrEqual(0);
    expect(headline).toBeLessThan(cta);
    expect(cta).toBeLessThan(secondary);
  });

  it('is the whole introduction: no carousel, no pager, no alternative exits', () => {
    const renderer = render();

    for (const gone of [
      'Siguiente',
      'Omitir',
      'Organiza tu hogar',
      'Guarda los momentos',
      'Ahorra en equipo',
    ]) {
      expect(textOf(renderer), `"${gone}" should no longer be on the entry screen`).not.toContain(
        gone,
      );
    }

    // Two actions and no more: `host` throws unless the testID resolves to
    // exactly one host element, so the pager and its dots are provably gone.
    host(renderer, 'value-props-start');
    host(renderer, 'value-props-login');
  });

  it('renders Meow as decoration: hidden from screen readers, never labelled "Meow"', () => {
    const renderer = render();

    expect(
      renderer.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' }),
    ).not.toHaveLength(0);
    expect(textOf(renderer)).not.toContain('Meow');
  });

  it('exposes the primary action as a reachable button that starts the real signup flow', () => {
    const renderer = render();

    const cta = host(renderer, 'value-props-start');
    expect(cta.props.accessibilityRole).toBe('button');
    expect(cta.props.accessibilityLabel).toBe('Comenzar');
    expect(cta.props.accessibilityState).toEqual({ disabled: false, busy: false });

    press(renderer, 'value-props-start');

    expect(navigation.navigate).toHaveBeenCalledWith('ChooseMethod');
  });

  it('keeps the secondary action subordinate: it goes to Login, never to signup', () => {
    const renderer = render();

    const secondary = host(renderer, 'value-props-login');
    expect(secondary.props.accessibilityRole).toBe('button');
    expect(secondary.props.accessibilityLabel).toBe('Iniciar sesión');

    press(renderer, 'value-props-login');

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
    expect(navigation.navigate).not.toHaveBeenCalledWith('ChooseMethod');
  });

  it('is laid out by the Screen primitive, not by its own scrolling or safe area', () => {
    const renderer = render();

    expect(renderer.root.findAll((node) => String(node.type) === 'SafeAreaView')).not.toHaveLength(
      0,
    );

    const scroll = host(renderer, 'value-props');
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.type).toBe('ScrollView');
  });

  it('has exactly two exits, so the old carousel cannot creep back in', () => {
    const renderer = render();

    press(renderer, 'value-props-start');
    press(renderer, 'value-props-login');

    const targets = navigation.navigate.mock.calls.map(([target]) => target);

    expect(new Set(targets)).toEqual(new Set(['ChooseMethod', 'Login']));
  });
});
