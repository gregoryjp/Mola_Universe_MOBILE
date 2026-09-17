import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const secureStore = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('expo-secure-store', () => secureStore);

const session = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresIn: 900,
  tokenType: 'Bearer' as const,
  sessionId: 's1',
};

const SESSION_KEY = 'mola.auth.session';

/** Re-imports the module with a stubbed Platform.OS, as the real react-native
 * package cannot be loaded in the node test environment. */
const loadFor = async (platform: string) => {
  vi.resetModules();
  vi.doMock('react-native', () => ({ Platform: { OS: platform } }));
  return import('@shared/utils/secureStorage');
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.doUnmock('react-native');
  vi.resetModules();
});

describe('secureStorage on web', () => {
  it('keeps the session in memory and never touches the keychain', async () => {
    const storage = await loadFor('web');

    await storage.saveSession(session);

    await expect(storage.loadSession()).resolves.toEqual(session);
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    expect(secureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('clears the in-memory session', async () => {
    const storage = await loadFor('web');

    await storage.saveSession(session);
    await storage.clearSession();

    await expect(storage.loadSession()).resolves.toBeNull();
    expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});

describe('secureStorage on native', () => {
  it('persists through expo-secure-store', async () => {
    secureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(session));
    const storage = await loadFor('ios');

    await storage.saveSession(session);
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(SESSION_KEY, JSON.stringify(session));

    await expect(storage.loadSession()).resolves.toEqual(session);
    expect(secureStore.getItemAsync).toHaveBeenCalledWith(SESSION_KEY);

    await storage.clearSession();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
  });

  it('returns null when the stored value is not valid JSON', async () => {
    secureStore.getItemAsync.mockResolvedValueOnce('not-json');
    const storage = await loadFor('android');

    await expect(storage.loadSession()).resolves.toBeNull();
  });

  it('returns null when there is nothing stored', async () => {
    secureStore.getItemAsync.mockResolvedValueOnce(null);
    const storage = await loadFor('android');

    await expect(storage.loadSession()).resolves.toBeNull();
  });
});
