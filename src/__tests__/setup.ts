import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react-native';

afterEach(() => {
  cleanup();
});

// Mock expo-secure-store
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => {
    const store = global.mockSecureStore || {};
    return (store as Record<string, string>)[key] || null;
  }),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    if (!global.mockSecureStore) global.mockSecureStore = {};
    (global.mockSecureStore as Record<string, string>)[key] = value;
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    if (global.mockSecureStore) {
      delete (global.mockSecureStore as Record<string, string>)[key];
    }
  }),
}));

// Mock axios
vi.mock('axios', () => {
  const axiosModule = require('axios');
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      })),
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

// Mock react-native
vi.mock('react-native', () => ({
  ...require('react-native'),
  Alert: {
    alert: vi.fn(),
  },
}));

declare global {
  var mockSecureStore: Record<string, string> | undefined;
}
