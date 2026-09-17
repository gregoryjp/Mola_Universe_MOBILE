import {
  readSosCoordinates,
  requestSosCoordinates,
  type SosCoordinates,
  type SosCoordinatesResult,
} from '@data/sos/location/expoLocation';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SosLocationStatus = 'checking' | 'ready' | 'permission' | 'unavailable';

const statusOf = (result: SosCoordinatesResult): SosLocationStatus =>
  result.obtained ? 'ready' : result.reason;

export interface SosLocation {
  status: SosLocationStatus;
  coordinates: SosCoordinates | null;
  /** User-initiated. The only path allowed to show the permission dialog. */
  enable: () => void;
}

/**
 * Tracks whether the device location can be attached to an SOS alert.
 *
 * Mounts quietly: it reads an already-granted permission instead of prompting,
 * so opening the screen never puts a system dialog in the way. The dialog only
 * appears if the user taps to enable sharing.
 *
 * Deliberately does NOT re-read when the alert fires. `getCurrentPositionAsync`
 * can take seconds and the backend has no endpoint to update an event's
 * location afterwards, so a fresh read at that moment would mean either a stall
 * between the user and the emergency button or a fix that arrives too late to
 * send. The screen shows what will be attached instead, and the alert goes out
 * on a single tap.
 */
export const useSosLocation = (): SosLocation => {
  const [status, setStatus] = useState<SosLocationStatus>('checking');
  const [coordinates, setCoordinates] = useState<SosCoordinates | null>(null);
  const active = useRef(true);

  const apply = useCallback((result: SosCoordinatesResult): void => {
    if (!active.current) return;
    setStatus(statusOf(result));
    setCoordinates(result.obtained ? result.coordinates : null);
  }, []);

  useEffect(() => {
    active.current = true;
    void readSosCoordinates().then(apply);
    return () => {
      active.current = false;
    };
  }, [apply]);

  const enable = useCallback(() => {
    setStatus('checking');
    void requestSosCoordinates().then(apply);
  }, [apply]);

  return { status, coordinates, enable };
};
