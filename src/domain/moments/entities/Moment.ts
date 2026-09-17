// Mirrors the backend moments contracts (modules/moments/interface/IMoment.ts).

export type MomentErrorCode =
  | 'MOMENT_NOT_FOUND'
  | 'MOMENT_INVITE_NOT_FOUND'
  | 'INVALID_VERIFICATION_TOKEN'
  | 'UNAUTHORIZED'
  | 'INVALID_INPUT'
  | 'INTERNAL_ERROR';

/** A gathering with a date (EVENT) or a quick decision (POLL). */
export type MomentType = 'POLL' | 'EVENT';

export type MomentStatus = 'OPEN' | 'CANCELLED';

/** RSVP state of a household member. `PENDING` is the initial value. */
export type ParticipantResponse = 'PENDING' | 'GOING' | 'NOT_GOING';

/** Answer of an external guest, collected on the invite web page. */
export type InviteStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

export interface Moment {
  id: string;
  householdId: string;
  createdBy: string;
  type: MomentType;
  title: string;
  description: string | null;
  /** ISO-8601 instant. EVENT moments with a date get a linked calendar entry. */
  eventDate: string | null;
  detail: string | null;
  status: MomentStatus;
  /** Set by the backend when the moment was synced into the household calendar. */
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MomentParticipant {
  id: string;
  momentId: string;
  userId: string;
  response: ParticipantResponse;
  respondedAt: string | null;
}

/** Detail payload: the moment plus the household members invited to it. */
export interface MomentDetail extends Moment {
  participants: MomentParticipant[];
}

/**
 * A guest without a Mola account. The backend never exposes the invite token
 * here — it only travels inside the email link, and the answer is collected on
 * that web page rather than in the app.
 */
export interface MomentExternalInvite {
  id: string;
  momentId: string;
  email: string;
  name: string | null;
  /** True when the invited email already belongs to a Mola account. */
  isMolaUser: boolean;
  status: InviteStatus;
  invitedAt: string;
  respondedAt: string | null;
}

export interface CreateMomentInput {
  type: MomentType;
  title: string;
  description?: string;
  eventDate?: string;
  detail?: string;
  /** Omitted means "every active household member" on the backend. */
  participantUserIds?: string[];
}

export interface UpdateMomentInput {
  title?: string;
  description?: string;
  eventDate?: string;
  detail?: string;
  /** `CANCELLED` cancels the moment without deleting it. */
  status?: MomentStatus;
}

export interface CreateExternalInviteInput {
  email: string;
  name?: string;
}

/** The two answers the RSVP buttons send. `PENDING` is never sent by the app. */
export type MomentRsvp = Extract<ParticipantResponse, 'GOING' | 'NOT_GOING'>;
