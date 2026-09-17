import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  getExpoPushTokenAsync: vi.fn(),
}));

vi.mock('expo-notifications', () => ({
  getPermissionsAsync: mocks.getPermissionsAsync,
  requestPermissionsAsync: mocks.requestPermissionsAsync,
  getExpoPushTokenAsync: mocks.getExpoPushTokenAsync,
}));

import {
  getExpoPushTokenSilently,
  getPushPermissionStatus,
  requestExpoPushToken,
} from '@data/notifications/push/expoPushToken';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPushPermissionStatus', () => {
  it('reads the status without ever prompting', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });

    await expect(getPushPermissionStatus()).resolves.toBe('undetermined');
    expect(mocks.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('passes through the denied state', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    await expect(getPushPermissionStatus()).resolves.toBe('denied');
  });
});

describe('getExpoPushTokenSilently', () => {
  it('resolves the token when the permission is already granted', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    mocks.getExpoPushTokenAsync.mockResolvedValueOnce({ data: 'ExponentPushToken[abc]' });

    await expect(getExpoPushTokenSilently()).resolves.toEqual({
      granted: true,
      token: 'ExponentPushToken[abc]',
    });
  });

  it('never prompts and never resolves a token when the permission was denied', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    await expect(getExpoPushTokenSilently()).resolves.toEqual({ granted: false });
    expect(mocks.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocks.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('treats undetermined as not granted, so app start stays dialog-free', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });

    await expect(getExpoPushTokenSilently()).resolves.toEqual({ granted: false });
    expect(mocks.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});

describe('requestExpoPushToken (manual activation path)', () => {
  it('prompts when the permission is not yet granted', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    mocks.requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    mocks.getExpoPushTokenAsync.mockResolvedValueOnce({ data: 'ExponentPushToken[xyz]' });

    await expect(requestExpoPushToken()).resolves.toEqual({
      granted: true,
      token: 'ExponentPushToken[xyz]',
    });
    expect(mocks.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('does not prompt again when the permission is already granted', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    mocks.getExpoPushTokenAsync.mockResolvedValueOnce({ data: 'ExponentPushToken[abc]' });

    await expect(requestExpoPushToken()).resolves.toEqual({
      granted: true,
      token: 'ExponentPushToken[abc]',
    });
    expect(mocks.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('resolves registered:false when the user declines the dialog', async () => {
    mocks.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    mocks.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    await expect(requestExpoPushToken()).resolves.toEqual({ granted: false });
    expect(mocks.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });
});
