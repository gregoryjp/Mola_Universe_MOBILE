import * as Location from 'expo-location';

export interface SosCoordinates {
  latitude: number;
  longitude: number;
}

export type SosCoordinatesResult =
  | { obtained: true; coordinates: SosCoordinates }
  | { obtained: false; reason: 'permission' | 'unavailable' };

/**
 * How long to wait for a fresh fix. An SOS must not be held up by the sensor:
 * indoors a fix takes many seconds, and the alert matters far more than the
 * exact pin. See the note on `getCurrentPositionAsync` in the SDK 57 docs.
 */
const FIX_TIMEOUT_MS = 5000;

/** A cached fix older than this is stale enough to mislead whoever responds. */
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;

const raceTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T | null> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      // Swallow a late rejection: once the timer wins, nobody awaits this
      // promise and an unhandled rejection would surface as a crash.
      promise.catch(() => null),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};

const toCoordinates = (position: Location.LocationObject): SosCoordinates => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
});

/**
 * Shared capture. Never rejects and never blocks longer than `FIX_TIMEOUT_MS`;
 * a missing permission or a missing fix are expected outcomes rather than
 * errors, because the alert has to go out either way.
 *
 * Tries a cached fix first because it resolves instantly, then falls back to a
 * fresh read at Balanced accuracy (about 100 m). High accuracy is deliberately
 * avoided — it takes longer, and the coordinates are only ever rendered as a
 * map link in the email the trusted contacts receive.
 */
const capture = async (allowPrompt: boolean): Promise<SosCoordinatesResult> => {
  try {
    let status = (await Location.getForegroundPermissionsAsync()).status;
    if (status !== 'granted' && allowPrompt) {
      status = (await Location.requestForegroundPermissionsAsync()).status;
    }
    if (status !== 'granted') return { obtained: false, reason: 'permission' };

    const cached = await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS });
    if (cached !== null) return { obtained: true, coordinates: toCoordinates(cached) };

    const fresh = await raceTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      FIX_TIMEOUT_MS,
    );
    if (fresh === null) return { obtained: false, reason: 'unavailable' };

    return { obtained: true, coordinates: toCoordinates(fresh) };
  } catch {
    // A native module failure must never take the alert down with it.
    return { obtained: false, reason: 'unavailable' };
  }
};

/**
 * Capture for the SOS screen, in response to an explicit user action. This is
 * the only entry point allowed to show the permission dialog, and the screen
 * only calls it from a control the user taps on purpose — never from the
 * activation button, which must stay a single tap.
 */
export const requestSosCoordinates = (): Promise<SosCoordinatesResult> => capture(true);

/**
 * Silent capture for screen mount and for the moment of activation. Reads the
 * permission without prompting: putting a system dialog between the user and
 * the emergency button would be the worst possible moment to ask.
 */
export const readSosCoordinates = (): Promise<SosCoordinatesResult> => capture(false);
