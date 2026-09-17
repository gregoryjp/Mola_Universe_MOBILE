import type {
  ActivatedSosEvent,
  ActivateSosInput,
  CreateTrustedContactInput,
  SosEvent,
  TrustedContact,
} from '../entities/Sos';

export interface SosError {
  code: string;
  message: string;
  statusCode: number;
}

export type SosResult<T> = { success: true; value: T } | { success: false; error: SosError };

/**
 * SOS port. Everything is user-scoped. The contact *verification* route
 * (`POST /sos/contacts/:contactId/verify`) is deliberately absent: it is a
 * public route used by the emailed link, not by an authenticated app flow.
 * Verified in modules/sos/routes/sosRoutes.ts.
 */
export interface SosRepository {
  listContacts(): Promise<SosResult<TrustedContact[]>>;
  createContact(input: CreateTrustedContactInput): Promise<SosResult<TrustedContact>>;
  /**
   * Regenerates the invitation and re-sends the email for a *pending* contact
   * (`POST /sos/contacts/:contactId/resend-invite`, authenticated). The backend
   * rejects an already-verified contact, so callers must only offer this while
   * `verified` is false. Returns the refreshed contact.
   */
  resendContactInvite(contactId: string): Promise<SosResult<TrustedContact>>;
  deleteContact(contactId: string): Promise<SosResult<void>>;
  activate(input: ActivateSosInput): Promise<SosResult<ActivatedSosEvent>>;
  cancel(sosEventId: string): Promise<SosResult<SosEvent>>;
  history(): Promise<SosResult<SosEvent[]>>;
}
