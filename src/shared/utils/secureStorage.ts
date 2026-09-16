import type { Session } from '@domain/auth/entities/Session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'mola.auth.session';

/**
 * expo-secure-store ships no web implementation: its web build is an empty
 * module, so every call throws `getValueWithKeyAsync is not a function`. Keep
 * the session in memory on web rather than falling back to localStorage, so
 * tokens never touch plain storage (docs/module-template.md §12). The trade-off
 * is that reloading the page signs the user out, which only affects the browser
 * preview — native still uses the OS keychain/keystore.
 */
const memorySession = new Map<string, string>();
const isWeb = Platform.OS === 'web';

const readRaw = async (): Promise<string | null> => {
  if (isWeb) return memorySession.get(SESSION_KEY) ?? null;
  return SecureStore.getItemAsync(SESSION_KEY);
};

const writeRaw = async (value: string): Promise<void> => {
  if (isWeb) {
    memorySession.set(SESSION_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
};

const removeRaw = async (): Promise<void> => {
  if (isWeb) {
    memorySession.delete(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

export const saveSession = async (session: Session): Promise<void> => {
  await writeRaw(JSON.stringify(session));
};

export const loadSession = async (): Promise<Session | null> => {
  const raw = await readRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await removeRaw();
};
