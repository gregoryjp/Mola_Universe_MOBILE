import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setTokens: (accessToken: string, refreshToken: string, userId: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  clearTokens: () => Promise<void>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  isHydrated: false,

  setTokens: async (accessToken: string, refreshToken: string, userId: string) => {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('userId', userId);
      set({ accessToken, refreshToken, userId });
    } catch (error) {
      console.error('Failed to set tokens:', error);
      throw error;
    }
  },

  getAccessToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('refreshToken');
      return token;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userId');
      set({ accessToken: null, refreshToken: null, userId: null });
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, userId] = await Promise.all([
        SecureStore.getItemAsync('accessToken'),
        SecureStore.getItemAsync('refreshToken'),
        SecureStore.getItemAsync('userId'),
      ]);
      set({ accessToken, refreshToken, userId, isHydrated: true });
    } catch (error) {
      console.error('Failed to hydrate session:', error);
      set({ isHydrated: true });
    }
  },
}));
