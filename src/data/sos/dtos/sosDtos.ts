// Mirrors the backend SOS payloads (modules/sos/services/*.ts).

export interface TrustedContactDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isMolaUser: boolean;
  pushEnabled: boolean;
  verified: boolean;
  createdAt: string;
}

export interface SosEventDto {
  id: string;
  status: string;
  message?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  activatedAt: string;
  dispatchedAt?: string | null;
  cancelledAt?: string | null;
}

/** `POST /sos/activate` adds the remaining cancellation window to the event. */
export interface ActivatedSosEventDto extends SosEventDto {
  cancelWindowMs: number;
}

/** `CreateTrustedContactSchema`: `{ name, email, phone? }`. */
export interface CreateTrustedContactRequestDto {
  name: string;
  email: string;
  phone?: string;
}

/** `ActivateSOSSchema`: all optional. */
export interface ActivateSosRequestDto {
  message?: string;
  locationLat?: number;
  locationLng?: number;
}

/** `CancelSOSSchema`: `{ sosEventId }`. */
export interface CancelSosRequestDto {
  sosEventId: string;
}
