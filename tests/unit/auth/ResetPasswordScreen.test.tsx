import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({ useResetPassword: vi.fn(), mutate: vi.fn() }));

vi.mock('@presentation/auth/hooks/useResetPassword', () => ({
  useResetPassword: mocks.useResetPassword,
}));

import { ResetPasswordScreen } from '@presentation/auth/screens/ResetPasswordScreen';

const byTestId = (renderer: ReactTestRenderer, testID: string) => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  if (!node) throw new Error(`No element with testID "${testID}"`);
  return node;
};

const navigation = { replace: vi.fn(), goBack: vi.fn() };
const route = { params: { email: 'a@b.com', verificationToken: 'token-1', code: '123456' } };

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <ResetPasswordScreen navigation={navigation as never} route={route as never} />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const fillMatchingPasswords = (renderer: ReactTestRenderer, password: string): void => {
  act(() => {
    byTestId(renderer, 'reset-password-new').props.onChangeText(password);
  });
  act(() => {
    byTestId(renderer, 'reset-password-confirm').props.onChangeText(password);
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useResetPassword.mockReturnValue({
    mutate: mocks.mutate,
    isPending: false,
    isError: false,
    error: null,
  });
});

describe('ResetPasswordScreen', () => {
  it('disables submit until the password is at least 8 chars and both fields match', () => {
    const renderer = render();
    expect(byTestId(renderer, 'reset-password-submit').props.disabled).toBe(true);

    fillMatchingPasswords(renderer, 'short');
    expect(byTestId(renderer, 'reset-password-submit').props.disabled).toBe(true);

    fillMatchingPasswords(renderer, 'password1');
    expect(byTestId(renderer, 'reset-password-submit').props.disabled).toBe(false);

    renderer.unmount();
  });

  it('submits the verification token and code carried from the OTP screen', () => {
    const renderer = render();
    fillMatchingPasswords(renderer, 'password1');

    act(() => {
      byTestId(renderer, 'reset-password-submit').props.onPress();
    });

    expect(mocks.mutate).toHaveBeenCalledWith(
      { verificationToken: 'token-1', code: '123456', newPassword: 'password1' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    renderer.unmount();
  });

  it('offers a way back to the OTP screen on a reset-password error', () => {
    mocks.useResetPassword.mockReturnValue({
      mutate: mocks.mutate,
      isPending: false,
      isError: true,
      error: { message: 'Código inválido o expirado' },
    });
    const renderer = render();

    act(() => {
      byTestId(renderer, 'reset-password-back').props.onPress();
    });
    expect(navigation.goBack).toHaveBeenCalled();

    renderer.unmount();
  });

  it('navigates to the success screen once the mutation resolves', () => {
    let onSuccessCallback: (() => void) | undefined;
    mocks.mutate.mockImplementation((_payload: unknown, options?: { onSuccess?: () => void }) => {
      onSuccessCallback = options?.onSuccess;
    });
    const renderer = render();
    fillMatchingPasswords(renderer, 'password1');

    act(() => {
      byTestId(renderer, 'reset-password-submit').props.onPress();
    });
    onSuccessCallback?.();

    expect(navigation.replace).toHaveBeenCalledWith('ResetPasswordSuccess');

    renderer.unmount();
  });
});
