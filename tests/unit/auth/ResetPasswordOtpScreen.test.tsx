import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({ useForgotPassword: vi.fn(), mutate: vi.fn() }));

vi.mock('@presentation/auth/hooks/useForgotPassword', () => ({
  useForgotPassword: mocks.useForgotPassword,
}));

import { ResetPasswordOtpScreen } from '@presentation/auth/screens/ResetPasswordOtpScreen';

const byTestId = (renderer: ReactTestRenderer, testID: string) => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  if (!node) throw new Error(`No element with testID "${testID}"`);
  return node;
};

const navigation = { navigate: vi.fn() };
const route = { params: { email: 'a@b.com', verificationToken: 'token-1' } };

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <ResetPasswordOtpScreen navigation={navigation as never} route={route as never} />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useForgotPassword.mockReturnValue({
    mutate: mocks.mutate,
    isPending: false,
    isError: false,
    error: null,
  });
});

describe('ResetPasswordOtpScreen', () => {
  it('disables Continuar until all 6 digits are entered', () => {
    const renderer = render();

    expect(byTestId(renderer, 'reset-otp-continue').props.disabled).toBe(true);

    act(() => {
      byTestId(renderer, 'reset-otp-0').props.onChangeText('123456');
    });

    expect(byTestId(renderer, 'reset-otp-continue').props.disabled).toBe(false);

    renderer.unmount();
  });

  it('navigates to ResetPassword with the entered code and the held verification token', () => {
    const renderer = render();

    act(() => {
      byTestId(renderer, 'reset-otp-0').props.onChangeText('654321');
    });
    act(() => {
      byTestId(renderer, 'reset-otp-continue').props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
      email: 'a@b.com',
      verificationToken: 'token-1',
      code: '654321',
    });

    renderer.unmount();
  });

  it('replaces the verification token with the fresh one a resend returns', () => {
    mocks.mutate.mockImplementation(
      (_email: string, options?: { onSuccess?: (data: unknown) => void }) => {
        options?.onSuccess?.({ verificationToken: 'token-2', message: 'Sent' });
      },
    );
    const renderer = render();

    act(() => {
      byTestId(renderer, 'reset-otp-resend').props.onPress();
    });
    act(() => {
      byTestId(renderer, 'reset-otp-0').props.onChangeText('111111');
    });
    act(() => {
      byTestId(renderer, 'reset-otp-continue').props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
      email: 'a@b.com',
      verificationToken: 'token-2',
      code: '111111',
    });

    renderer.unmount();
  });

  it('disables the resend button after a resend (cooldown)', () => {
    mocks.mutate.mockImplementation(
      (_email: string, options?: { onSuccess?: (data: unknown) => void }) => {
        options?.onSuccess?.({ verificationToken: 'token-2', message: 'Sent' });
      },
    );
    const renderer = render();

    expect(byTestId(renderer, 'reset-otp-resend').props.disabled).toBe(false);

    act(() => {
      byTestId(renderer, 'reset-otp-resend').props.onPress();
    });

    expect(byTestId(renderer, 'reset-otp-resend').props.disabled).toBe(true);

    renderer.unmount();
  });
});
