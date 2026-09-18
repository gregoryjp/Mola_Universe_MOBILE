import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { ResetPasswordSuccessScreen } from '@presentation/auth/screens/ResetPasswordSuccessScreen';

describe('ResetPasswordSuccessScreen', () => {
  it('resets the stack back to Login so back does not return to the password form', () => {
    const navigation = { reset: vi.fn() };
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <ResetPasswordSuccessScreen navigation={navigation as never} route={{} as never} />,
      );
    });
    if (!renderer) throw new Error('renderer not created');

    const loginButton = renderer.root.findAll(
      (node) =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === 'Iniciar sesión',
    )[0];
    if (!loginButton) throw new Error('No element with accessibilityLabel "Iniciar sesión"');

    act(() => {
      loginButton.props.onPress();
    });

    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Login' }] });

    renderer.unmount();
  });
});
