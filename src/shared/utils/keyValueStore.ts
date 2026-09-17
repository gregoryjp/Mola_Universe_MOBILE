import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Small key/value store over `expo-secure-store`, shared by the session and the
 * active-household preference.
 *
 * expo-secure-store ships no web implementation: its web build is an empty
 * module, so every call throws `getValueWithKeyAsync is not a function`. On web
 * the values are kept in memory instead of falling back to localStorage, so they
 * never touch plain storage (docs/module-template.md §12). The trade-off is that
 * reloading the browser preview signs the user out, which only affects the web
 * preview — native still uses the OS keychain/keystore.
 */
const memory = new Map<string, string>();
const isWeb = Platform.OS === 'web';

export const readItem = async (key: string): Promise<string | null> => {
  if (isWeb) return memory.get(key) ?? null;
  return SecureStore.getItemAsync(key);
};

export const writeItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    memory.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

export const removeItem = async (key: string): Promise<void> => {
  if (isWeb) {
    memory.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};
