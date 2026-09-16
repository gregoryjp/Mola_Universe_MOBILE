import type { Session } from '@domain/auth/entities/Session';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'mola.auth.session';

/**
 * Persists the session (incl. tokens) in the OS keychain/keystore via
 * expo-secure-store. Tokens must never live in MMKV or plain storage — see
 * docs/module-template.md §12.
 */
export const saveSession = async (session: Session): Promise<void> => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = async (): Promise<Session | null> => {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};
