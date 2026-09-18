import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { ChooseMethodScreen } from '@presentation/auth/screens/ChooseMethodScreen';

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
    renderer = create(<ChooseMethodScreen navigation={navigation as never} route={{} as never} />);
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

describe('ChooseMethodScreen — how the account gets created', () => {
  it('names the step with a real headline', () => {
    expect(textOf(render())).toContain('Crea tu cuenta');
  });

  it('offers email as the one method that works today', () => {
    const renderer = render();

    const email = host(renderer, 'choose-method-email');
    expect(email.props.accessibilityRole).toBe('button');
    expect(email.props.accessibilityLabel).toBe('Continuar con email');

    press(renderer, 'choose-method-email');

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('reserves room for OAuth without rendering an action that cannot work', () => {
    const slot = host(render(), 'choose-method-oauth-slot');

    expect(slot.children).toHaveLength(0);
    expect(textOf(render())).not.toMatch(/Apple|Google/i);
  });

  it('sends an existing user to Login, not to signup', () => {
    const renderer = render();

    press(renderer, 'choose-method-login');

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
    expect(navigation.navigate).not.toHaveBeenCalledWith('Register');
  });

  it('keeps exactly two actions, so nothing competes with creating the account', () => {
    const buttons = render().root.findAll(
      (node) => typeof node.type === 'string' && node.props.accessibilityRole === 'button',
    );

    expect(buttons).toHaveLength(2);
  });

  it('states the legal terms as plain text: no destination exists to link to yet', () => {
    const renderer = render();

    expect(textOf(renderer)).toContain('Términos de Servicio');

    const pressables = renderer.root.findAll(
      (node) =>
        typeof node.type === 'string' &&
        typeof node.props.onPress === 'function' &&
        // the two Buttons are the only tappable things on the screen
        node.props.accessibilityRole !== 'button',
    );

    expect(pressables).toHaveLength(0);
  });
});
