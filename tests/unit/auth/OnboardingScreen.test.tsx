import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useUpdateProfile: vi.fn(),
  mutate: vi.fn(),
  saveSession: vi.fn(),
  loadSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@shared/utils/secureStorage', () => ({
  saveSession: mocks.saveSession,
  loadSession: mocks.loadSession,
  clearSession: mocks.clearSession,
}));

vi.mock('@presentation/auth/hooks/useUpdateProfile', () => ({
  useUpdateProfile: mocks.useUpdateProfile,
}));

import { OnboardingScreen } from '@presentation/auth/screens/OnboardingScreen';
import { useAuthStore } from '@shared/store/authStore';

const byTestId = (renderer: ReactTestRenderer, testID: string) => {
  const node = renderer.root.findAll((candidate) => candidate.props.testID === testID)[0];
  if (!node) throw new Error(`No element with testID "${testID}"`);
  return node;
};

const navigation = { navigate: vi.fn() };

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ada',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<OnboardingScreen navigation={navigation as never} route={{} as never} />);
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
    verificationToken: null,
  });
  mocks.useUpdateProfile.mockReturnValue({
    mutate: mocks.mutate,
    isPending: false,
    isError: false,
    error: null,
  });
});

describe('OnboardingScreen', () => {
  it('prefills the name input with the current user name', () => {
    const renderer = render();
    expect(byTestId(renderer, 'onboarding-name').props.value).toBe('Ada');
    renderer.unmount();
  });

  it('skips the PATCH call and goes straight to Dashboard when the name is unchanged', () => {
    const renderer = render();

    act(() => {
      byTestId(renderer, 'onboarding-continue').props.onPress();
    });

    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'Dashboard' });

    renderer.unmount();
  });

  it('updates the profile with the new name before continuing', () => {
    let onSuccessCallback: (() => void) | undefined;
    mocks.mutate.mockImplementation((_payload: unknown, options?: { onSuccess?: () => void }) => {
      onSuccessCallback = options?.onSuccess;
    });
    const renderer = render();

    act(() => {
      byTestId(renderer, 'onboarding-name').props.onChangeText('Ada Lovelace');
    });
    act(() => {
      byTestId(renderer, 'onboarding-continue').props.onPress();
    });

    expect(mocks.mutate).toHaveBeenCalledWith(
      { displayName: 'Ada Lovelace' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(navigation.navigate).not.toHaveBeenCalled();

    onSuccessCallback?.();
    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'Dashboard' });

    renderer.unmount();
  });

  it('routes to CreateHousehold when "Sí, crear uno" is selected', () => {
    const renderer = render();

    act(() => {
      byTestId(renderer, 'onboarding-household-create').props.onPress();
    });
    act(() => {
      byTestId(renderer, 'onboarding-continue').props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('CreateHousehold');

    renderer.unmount();
  });

  it('"Omitir por ahora" always goes to Dashboard without saving the name', () => {
    const renderer = render();

    act(() => {
      byTestId(renderer, 'onboarding-name').props.onChangeText('Something else');
    });
    act(() => {
      byTestId(renderer, 'onboarding-skip').props.onPress();
    });

    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'Dashboard' });

    renderer.unmount();
  });
});
