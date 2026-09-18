import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const nativeMocks = vi.hoisted(() => ({
  announceForAccessibility: vi.fn(),
}));

vi.mock('react-native', async () => {
  const { reactNativeStub } = await import('../../helpers/reactNativeStub');
  return {
    ...reactNativeStub,
    AccessibilityInfo: {
      ...reactNativeStub.AccessibilityInfo,
      announceForAccessibility: nativeMocks.announceForAccessibility,
    },
  };
});

const mocks = vi.hoisted(() => ({
  useVerifyOtp: vi.fn(),
  verifyOtpMutate: vi.fn(),
  verifyOtpReset: vi.fn(),
  useResendVerification: vi.fn(),
  resendMutate: vi.fn(),
  resendReset: vi.fn(),
  useLogout: vi.fn(),
  logoutMutate: vi.fn(),
  saveSession: vi.fn(),
  loadSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@shared/utils/secureStorage', () => ({
  saveSession: mocks.saveSession,
  loadSession: mocks.loadSession,
  clearSession: mocks.clearSession,
}));

vi.mock('@presentation/auth/hooks/useVerifyOtp', () => ({
  useVerifyOtp: mocks.useVerifyOtp,
}));

vi.mock('@presentation/auth/hooks/useLogout', () => ({
  useLogout: mocks.useLogout,
}));

vi.mock('@presentation/auth/hooks/useResendVerification', () => ({
  useResendVerification: mocks.useResendVerification,
}));

import { VerifyEmailScreen } from '@presentation/auth/screens/VerifyEmailScreen';
import { useAuthStore } from '@shared/store/authStore';

const byTestId = (renderer: ReactTestRenderer, testID: string) => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  if (!node) throw new Error(`No element with testID "${testID}"`);
  return node;
};

const findByTestId = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];

const navigation = { navigate: vi.fn() };

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const focusMocks = new Map<string, ReturnType<typeof vi.fn>>();

const createNodeMock = (element: { props: unknown }): { focus: () => void } => {
  const testID = (element.props as { testID?: string }).testID;
  const focus = vi.fn();
  if (testID) focusMocks.set(testID, focus);
  return { focus };
};

const render = (): ReactTestRenderer => {
  focusMocks.clear();
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<VerifyEmailScreen navigation={navigation as never} route={{} as never} />, {
      createNodeMock,
    });
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user,
    session: null,
    isAuthenticated: true,
    isHydrated: true,
    verificationToken: 'challenge',
    verificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
  mocks.useVerifyOtp.mockReturnValue({
    mutate: mocks.verifyOtpMutate,
    reset: mocks.verifyOtpReset,
    isPending: false,
    isError: false,
    error: null,
  });
  mocks.useResendVerification.mockReturnValue({
    mutate: mocks.resendMutate,
    reset: mocks.resendReset,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  });
  mocks.useLogout.mockReturnValue({ mutate: mocks.logoutMutate, isPending: false });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('VerifyEmailScreen', () => {
  it('disables Verificar until all 6 digits are entered', () => {
    const renderer = render();

    expect(byTestId(renderer, 'verify-email-submit').props.disabled).toBe(true);

    act(() => {
      byTestId(renderer, 'verify-email-otp-0').props.onChangeText('123456');
    });

    expect(byTestId(renderer, 'verify-email-submit').props.disabled).toBe(false);

    renderer.unmount();
  });

  it('submits the held verification token with the entered code', () => {
    const renderer = render();

    act(() => {
      byTestId(renderer, 'verify-email-otp-0').props.onChangeText('654321');
    });
    act(() => {
      byTestId(renderer, 'verify-email-submit').props.onPress();
    });

    expect(mocks.verifyOtpMutate).toHaveBeenCalledWith(
      { verificationToken: 'challenge', code: '654321' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    renderer.unmount();
  });

  it('navigates to Onboarding once verification succeeds', () => {
    let onSuccessCallback: (() => void) | undefined;
    mocks.verifyOtpMutate.mockImplementation(
      (_payload: unknown, options?: { onSuccess?: () => void }) => {
        onSuccessCallback = options?.onSuccess;
      },
    );
    const renderer = render();

    act(() => {
      byTestId(renderer, 'verify-email-otp-0').props.onChangeText('654321');
    });
    act(() => {
      byTestId(renderer, 'verify-email-submit').props.onPress();
    });
    onSuccessCallback?.();

    expect(navigation.navigate).toHaveBeenCalledWith('Onboarding');

    renderer.unmount();
  });

  it('overrides the AUTH_INVALID_CREDENTIALS message with OTP-specific copy', () => {
    mocks.useVerifyOtp.mockReturnValue({
      mutate: mocks.verifyOtpMutate,
      reset: mocks.verifyOtpReset,
      isPending: false,
      isError: true,
      error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
    const renderer = render();

    const rendered = JSON.stringify(renderer.toJSON());
    expect(rendered).toContain('Código incorrecto, inténtalo de nuevo');
    expect(rendered).not.toContain('Invalid email or password');

    renderer.unmount();
  });

  it('keeps wrong-code entry editable and clears the stale error when the user retries', () => {
    mocks.useVerifyOtp.mockReturnValue({
      mutate: mocks.verifyOtpMutate,
      reset: mocks.verifyOtpReset,
      isPending: false,
      isError: true,
      error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
    const renderer = render();

    expect(byTestId(renderer, 'verify-email-otp-0').props.editable).toBe(true);
    act(() => {
      byTestId(renderer, 'verify-email-otp-0').props.onChangeText('1');
    });
    expect(mocks.verifyOtpReset).toHaveBeenCalled();

    renderer.unmount();
  });

  it('offers a resend action when the backend says the current code expired', () => {
    mocks.useVerifyOtp.mockReturnValue({
      mutate: mocks.verifyOtpMutate,
      reset: mocks.verifyOtpReset,
      isPending: false,
      isError: true,
      error: { code: 'AUTH_OTP_EXPIRED', message: 'Code expired' },
    });
    const renderer = render();

    expect(findByTestId(renderer, 'verify-email-resend')).toBeTruthy();
    expect(byTestId(renderer, 'verify-email-submit').props.disabled).toBe(true);

    act(() => {
      byTestId(renderer, 'verify-email-resend').props.onPress();
    });
    expect(mocks.resendMutate).toHaveBeenCalledWith(
      'a@b.com',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    renderer.unmount();
  });

  it('recovers a cold-started unverified session by offering resend without a token', () => {
    useAuthStore.setState({ verificationToken: null, verificationExpiresAt: null });
    const renderer = render();

    expect(findByTestId(renderer, 'verify-email-resend')).toBeTruthy();
    expect(byTestId(renderer, 'verify-email-submit').props.disabled).toBe(true);

    renderer.unmount();
  });

  it('counts down from otpExpiresAt and announces expiry exactly once', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T10:00:00.000Z'));
    useAuthStore.setState({
      verificationToken: 'challenge',
      verificationExpiresAt: '2026-09-18T10:00:02.000Z',
    });
    const renderer = render();

    expect(JSON.stringify(renderer.toJSON())).toContain('0:02');

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(JSON.stringify(renderer.toJSON())).toContain('El código ha caducado');
    expect(nativeMocks.announceForAccessibility).toHaveBeenCalledTimes(1);
    expect(byTestId(renderer, 'verify-email-submit').props.disabled).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(nativeMocks.announceForAccessibility).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('clears the code and refocuses the first box after a successful resend', () => {
    useAuthStore.setState({ verificationExpiresAt: '2026-09-18T00:00:00.000Z' });
    let onSuccess:
      | ((data: {
          verificationToken: string;
          otpExpiresAt: string;
          otpExpiresIn: number;
          message: string;
        }) => void)
      | undefined;
    mocks.resendMutate.mockImplementation(
      (
        _email: string,
        options?: {
          onSuccess?: (data: {
            verificationToken: string;
            otpExpiresAt: string;
            otpExpiresIn: number;
            message: string;
          }) => void;
        },
      ) => {
        onSuccess = options?.onSuccess;
      },
    );
    const renderer = render();

    act(() => {
      byTestId(renderer, 'verify-email-otp-0').props.onChangeText('654321');
    });
    act(() => {
      byTestId(renderer, 'verify-email-resend').props.onPress();
      onSuccess?.({
        verificationToken: 'fresh',
        otpExpiresAt: '2026-09-18T10:01:00.000Z',
        otpExpiresIn: 60,
        message: 'Sent',
      });
    });

    expect(byTestId(renderer, 'verify-email-otp-0').props.value).toBe('');
    expect(mocks.verifyOtpReset).toHaveBeenCalled();
    expect(focusMocks.get('verify-email-otp-0')).toHaveBeenCalled();

    renderer.unmount();
  });

  it('shows a network-specific resend error and keeps retry available', () => {
    useAuthStore.setState({ verificationExpiresAt: '2026-09-18T00:00:00.000Z' });
    mocks.useResendVerification.mockReturnValue({
      mutate: mocks.resendMutate,
      reset: mocks.resendReset,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: { code: 'NETWORK_ERROR', message: 'offline', statusCode: 0 },
    });
    const renderer = render();

    expect(JSON.stringify(renderer.toJSON())).toContain('Revisa tu conexión');
    expect(byTestId(renderer, 'verify-email-resend').props.disabled).toBe(false);

    renderer.unmount();
  });

  it('shows rate limiting without inventing a retry countdown', () => {
    useAuthStore.setState({ verificationExpiresAt: '2026-09-18T00:00:00.000Z' });
    mocks.useResendVerification.mockReturnValue({
      mutate: mocks.resendMutate,
      reset: mocks.resendReset,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: { code: 'RATE_LIMITED', message: 'Too many requests', statusCode: 429 },
    });
    const renderer = render();
    const rendered = JSON.stringify(renderer.toJSON());

    expect(rendered).toContain('Has solicitado demasiados códigos');
    expect(rendered).not.toContain('Inténtalo de nuevo en');
    expect(byTestId(renderer, 'verify-email-resend').props.disabled).toBe(false);

    renderer.unmount();
  });
});
