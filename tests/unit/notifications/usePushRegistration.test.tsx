import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPushPermissionStatus: vi.fn(),
  getExpoPushTokenSilently: vi.fn(),
  registerDevice: vi.fn(),
  auth: { isAuthenticated: true, user: { id: 'u1' } } as {
    isAuthenticated: boolean;
    user: { id: string } | null;
  },
}));

vi.mock('@data/notifications/push/expoPushToken', () => ({
  getPushPermissionStatus: mocks.getPushPermissionStatus,
  getExpoPushTokenSilently: mocks.getExpoPushTokenSilently,
}));

vi.mock('@data/notifications/repositories/NotificationRepositoryImpl', () => ({
  notificationRepository: { registerDevice: mocks.registerDevice },
}));

vi.mock('@shared/store/authStore', () => ({
  useAuthStore: (selector: (state: typeof mocks.auth) => unknown) => selector(mocks.auth),
}));

import { usePushRegistrationStatus } from '@presentation/notifications/hooks/usePushRegistration';

const render = async <T,>(
  useHook: () => T,
): Promise<{ captured: () => T; renderer: ReactTestRenderer }> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let value: T | undefined;
  const Harness = (): null => {
    value = useHook();
    return null;
  };
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  const capturedRenderer = renderer;
  return {
    captured: () => {
      if (value === undefined) throw new Error('hook not captured');
      return value;
    },
    renderer: capturedRenderer,
  };
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.isAuthenticated = true;
  mocks.auth.user = { id: 'u1' };
});

describe('usePushRegistrationStatus (TD-026)', () => {
  it('auto-registers the device when the permission is already granted', async () => {
    mocks.getPushPermissionStatus.mockResolvedValue('granted');
    mocks.getExpoPushTokenSilently.mockResolvedValue({ granted: true, token: 'tok-1' });
    mocks.registerDevice.mockResolvedValue({ success: true, value: { registered: true } });

    const { captured, renderer } = await render(usePushRegistrationStatus);
    await flush();

    expect(mocks.registerDevice).toHaveBeenCalledWith('tok-1');
    expect(captured().data).toEqual({ state: 'active', permission: 'granted' });

    renderer.unmount();
  });

  it('never prompts nor registers when the permission was denied', async () => {
    mocks.getPushPermissionStatus.mockResolvedValue('denied');

    const { captured, renderer } = await render(usePushRegistrationStatus);
    await flush();

    expect(mocks.getExpoPushTokenSilently).not.toHaveBeenCalled();
    expect(mocks.registerDevice).not.toHaveBeenCalled();
    expect(captured().data).toEqual({ state: 'inactive', permission: 'denied' });

    renderer.unmount();
  });

  it('leaves the state inactive when the permission is still undetermined', async () => {
    mocks.getPushPermissionStatus.mockResolvedValue('undetermined');

    const { captured, renderer } = await render(usePushRegistrationStatus);
    await flush();

    expect(mocks.registerDevice).not.toHaveBeenCalled();
    expect(captured().data).toEqual({ state: 'inactive', permission: 'undetermined' });

    renderer.unmount();
  });

  it('reports failed when the backend refuses the registration', async () => {
    mocks.getPushPermissionStatus.mockResolvedValue('granted');
    mocks.getExpoPushTokenSilently.mockResolvedValue({ granted: true, token: 'tok-1' });
    mocks.registerDevice.mockResolvedValue({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid push token', statusCode: 400 },
    });

    const { captured, renderer } = await render(usePushRegistrationStatus);
    await flush();

    expect(captured().data).toEqual({ state: 'failed', permission: 'granted' });

    renderer.unmount();
  });

  it('does nothing at all while there is no session', async () => {
    mocks.auth.isAuthenticated = false;
    mocks.auth.user = null;

    const { captured, renderer } = await render(usePushRegistrationStatus);
    await flush();

    expect(mocks.getPushPermissionStatus).not.toHaveBeenCalled();
    expect(mocks.registerDevice).not.toHaveBeenCalled();
    expect(captured().data).toBeUndefined();

    renderer.unmount();
  });
});
