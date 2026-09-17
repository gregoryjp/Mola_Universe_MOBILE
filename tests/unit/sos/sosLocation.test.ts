import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getForegroundPermissionsAsync: vi.fn(),
  requestForegroundPermissionsAsync: vi.fn(),
  getLastKnownPositionAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn(),
}));

vi.mock('expo-location', () => ({
  getForegroundPermissionsAsync: mocks.getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync: mocks.requestForegroundPermissionsAsync,
  getLastKnownPositionAsync: mocks.getLastKnownPositionAsync,
  getCurrentPositionAsync: mocks.getCurrentPositionAsync,
  Accuracy: { Balanced: 3, High: 4 },
}));

import { readSosCoordinates, requestSosCoordinates } from '@data/sos/location/expoLocation';

const position = (latitude: number, longitude: number) => ({
  coords: { latitude, longitude },
  timestamp: 1_760_000_000_000,
});

const granted = { status: 'granted' };
const denied = { status: 'denied' };

/** Permission, no cache, fresh fix. The shortest happy path. */
const primeFresh = (latitude = 40.4168, longitude = -3.7038): void => {
  mocks.getForegroundPermissionsAsync.mockResolvedValue(granted);
  mocks.getLastKnownPositionAsync.mockResolvedValue(null);
  mocks.getCurrentPositionAsync.mockResolvedValue(position(latitude, longitude));
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('readSosCoordinates (silent)', () => {
  it('returns a cached fix without touching the sensor', async () => {
    mocks.getForegroundPermissionsAsync.mockResolvedValue(granted);
    mocks.getLastKnownPositionAsync.mockResolvedValue(position(40.4, -3.7));

    await expect(readSosCoordinates()).resolves.toEqual({
      obtained: true,
      coordinates: { latitude: 40.4, longitude: -3.7 },
    });
    expect(mocks.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('does NOT show the permission dialog when permission was never granted', async () => {
    mocks.getForegroundPermissionsAsync.mockResolvedValue(denied);

    await expect(readSosCoordinates()).resolves.toEqual({
      obtained: false,
      reason: 'permission',
    });
    expect(mocks.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('falls back to a fresh fix at Balanced accuracy when there is no cache', async () => {
    primeFresh();

    await expect(readSosCoordinates()).resolves.toEqual({
      obtained: true,
      coordinates: { latitude: 40.4168, longitude: -3.7038 },
    });
    expect(mocks.getCurrentPositionAsync).toHaveBeenCalledWith(
      expect.objectContaining({ accuracy: 3 }),
    );
  });
});

describe('requestSosCoordinates (user-initiated)', () => {
  it('prompts and captures when the user enables sharing', async () => {
    mocks.getForegroundPermissionsAsync.mockResolvedValue(denied);
    mocks.requestForegroundPermissionsAsync.mockResolvedValue(granted);
    mocks.getLastKnownPositionAsync.mockResolvedValue(position(41.3874, 2.1686));

    await expect(requestSosCoordinates()).resolves.toEqual({
      obtained: true,
      coordinates: { latitude: 41.3874, longitude: 2.1686 },
    });
    expect(mocks.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('reports permission when the user declines the dialog', async () => {
    mocks.getForegroundPermissionsAsync.mockResolvedValue(denied);
    mocks.requestForegroundPermissionsAsync.mockResolvedValue(denied);

    await expect(requestSosCoordinates()).resolves.toEqual({
      obtained: false,
      reason: 'permission',
    });
    expect(mocks.getLastKnownPositionAsync).not.toHaveBeenCalled();
  });
});

describe('the alert must never be taken down by the location', () => {
  it('treats a sensor rejection as unavailable instead of throwing', async () => {
    mocks.getForegroundPermissionsAsync.mockResolvedValue(granted);
    mocks.getLastKnownPositionAsync.mockResolvedValue(null);
    mocks.getCurrentPositionAsync.mockRejectedValue(new Error('location services disabled'));

    await expect(readSosCoordinates()).resolves.toEqual({
      obtained: false,
      reason: 'unavailable',
    });
  });

  it('gives up after the fix timeout rather than holding the SOS', async () => {
    vi.useFakeTimers();
    mocks.getForegroundPermissionsAsync.mockResolvedValue(granted);
    mocks.getLastKnownPositionAsync.mockResolvedValue(null);
    // A fix that never arrives, which is what happens indoors.
    mocks.getCurrentPositionAsync.mockReturnValue(new Promise(() => undefined));

    const pending = readSosCoordinates();
    await vi.advanceTimersByTimeAsync(5000);

    await expect(pending).resolves.toEqual({ obtained: false, reason: 'unavailable' });
    vi.useRealTimers();
  });

  it('survives a native module failure in the permission check', async () => {
    mocks.getForegroundPermissionsAsync.mockRejectedValue(new Error('module not linked'));

    await expect(readSosCoordinates()).resolves.toEqual({
      obtained: false,
      reason: 'unavailable',
    });
  });
});
