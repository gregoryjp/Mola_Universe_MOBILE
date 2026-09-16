// Mirrors the backend SOS contracts (modules/sos/interface/ISOS.ts).

export type SosEventStatus = 'PENDING' | 'SENT' | 'CANCELLED';

export interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  /** True when the contact also has a MOLA account (push is possible). */
  isMolaUser: boolean;
  pushEnabled: boolean;
  /** False until the contact accepts through the emailed link. */
  verified: boolean;
  createdAt: string;
}

export interface SosEvent {
  id: string;
  status: SosEventStatus;
  message: string | null;
  locationLat: number | null;
  locationLng: number | null;
  activatedAt: string;
  dispatchedAt: string | null;
  cancelledAt: string | null;
}

/**
 * An activation still inside its cancellation window. `cancelWindowMs` is the
 * remaining time the backend accepts a cancel in; after it the event is
 * dispatched and can no longer be stopped (409 on cancel).
 */
export interface ActivatedSosEvent extends SosEvent {
  cancelWindowMs: number;
}

export interface CreateTrustedContactInput {
  name: string;
  email: string;
  phone?: string;
}

export interface ActivateSosInput {
  message?: string;
  locationLat?: number;
  locationLng?: number;
}
