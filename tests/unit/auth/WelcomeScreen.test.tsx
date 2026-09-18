import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

import { WelcomeScreen } from '@presentation/auth/screens/WelcomeScreen';

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
    renderer = create(<WelcomeScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const press = (renderer: ReactTestRenderer, testID: string): void => {
  const target = host(renderer, testID);
  act(() => {
    target.props.onPress();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WelcomeScreen — brand / moment / action', () => {
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

  it('renders Meow as decoration: hidden from screen readers, never labelled "Meow"', () => {
    const renderer = render();

    expect(
      renderer.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' }),
    ).not.toHaveLength(0);
    expect(textOf(renderer)).not.toContain('Meow');
  });

  it('exposes the primary action as a reachable button that starts the real signup flow', () => {
    const renderer = render();

    const cta = host(renderer, 'welcome-start');
    expect(cta.props.accessibilityRole).toBe('button');
    expect(cta.props.accessibilityLabel).toBe('Comenzar');
    expect(cta.props.accessibilityState).toEqual({ disabled: false, busy: false });

    press(renderer, 'welcome-start');

    expect(navigation.navigate).toHaveBeenCalledWith('ValueProps');
  });

  it('keeps the secondary action subordinate: it goes to Login, never to signup', () => {
    const renderer = render();

    const secondary = host(renderer, 'welcome-login');
    expect(secondary.props.accessibilityRole).toBe('button');
    expect(secondary.props.accessibilityLabel).toBe('Iniciar sesión');

    press(renderer, 'welcome-login');

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
    expect(navigation.navigate).not.toHaveBeenCalledWith('ValueProps');
  });
});
