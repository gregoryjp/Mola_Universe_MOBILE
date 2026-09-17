import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ read: vi.fn(), request: vi.fn() }));

vi.mock('@data/sos/location/expoLocation', () => ({
  readSosCoordinates: mocks.read,
  requestSosCoordinates: mocks.request,
}));

import type { SosCoordinatesResult } from '@data/sos/location/expoLocation';
import { useSosLocation } from '@presentation/sos/hooks/useSosLocation';

type SosLocation = ReturnType<typeof useSosLocation>;

const obtained = (latitude: number, longitude: number): SosCoordinatesResult => ({
  obtained: true,
  coordinates: { latitude, longitude },
});

/**
 * Deterministic drain of the microtask queue. No wall-clock timer, so these
 * tests cannot go flaky under load (see TD-030).
 */
const drain = async (): Promise<void> => {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

const render = async (): Promise<{
  captured: () => SosLocation;
  renderer: ReactTestRenderer;
}> => {
  let value: SosLocation | undefined;
  const Harness = (): null => {
    value = useSosLocation();
    return null;
  };
  let renderer: ReactTestRenderer | undefined;
  // create + mount effects + the pending promise all settle inside one act, so
  // React never sees an update from outside it.
  await act(async () => {
    renderer = create(<Harness />);
    await drain();
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

const run = async (action: () => void): Promise<void> => {
  await act(async () => {
    action();
    await drain();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSosLocation', () => {
  it('reads the location quietly on mount, never prompting', async () => {
    mocks.read.mockResolvedValueOnce(obtained(40.4168, -3.7038));

    const { captured, renderer } = await render();

    expect(captured().status).toBe('ready');
    expect(captured().coordinates).toEqual({ latitude: 40.4168, longitude: -3.7038 });
    expect(mocks.read).toHaveBeenCalledTimes(1);
    // Opening the SOS screen must not put a system dialog in the way.
    expect(mocks.request).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('reports a denied permission without coordinates', async () => {
    mocks.read.mockResolvedValueOnce({ obtained: false, reason: 'permission' });

    const { captured, renderer } = await render();

    expect(captured().status).toBe('permission');
    expect(captured().coordinates).toBeNull();

    renderer.unmount();
  });

  it('reports an unavailable fix separately from a denied permission', async () => {
    mocks.read.mockResolvedValueOnce({ obtained: false, reason: 'unavailable' });

    const { captured, renderer } = await render();

    expect(captured().status).toBe('unavailable');
    expect(captured().coordinates).toBeNull();

    renderer.unmount();
  });

  it('prompts only when the user enables sharing', async () => {
    mocks.read.mockResolvedValueOnce({ obtained: false, reason: 'permission' });
    mocks.request.mockResolvedValueOnce(obtained(41.3874, 2.1686));

    const { captured, renderer } = await render();
    expect(captured().status).toBe('permission');

    await run(() => captured().enable());

    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(captured().status).toBe('ready');
    expect(captured().coordinates).toEqual({ latitude: 41.3874, longitude: 2.1686 });

    renderer.unmount();
  });
});
