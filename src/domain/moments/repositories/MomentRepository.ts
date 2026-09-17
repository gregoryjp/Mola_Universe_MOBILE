import type {
  CreateExternalInviteInput,
  CreateMomentInput,
  Moment,
  MomentDetail,
  MomentExternalInvite,
  MomentParticipant,
  MomentRsvp,
  UpdateMomentInput,
} from '../entities/Moment';

export interface MomentError {
  code: string;
  message: string;
  statusCode: number;
}

export type MomentResult<T> = { success: true; value: T } | { success: false; error: MomentError };

/**
 * Moments port. Every route is household-scoped.
 *
 * Three backend behaviours worth knowing before reading the call sites:
 * - the list is a flat array with no pagination;
 * - editing and deleting are creator-only (403 otherwise), so the UI has to
 *   gate them instead of showing buttons that always fail;
 * - external guests answer through a tokenised web page, so the app creates
 *   and lists invites but never responds to them.
 *
 * Verified in modules/moments/routes/momentRoutes.ts.
 *
 * Deliberately absent: the game-results routes. Those belong to the game
 * engine (backend 3b), not to this module.
 */
export interface MomentRepository {
  listMoments(householdId: string): Promise<MomentResult<Moment[]>>;
  getMoment(householdId: string, momentId: string): Promise<MomentResult<MomentDetail>>;
  createMoment(householdId: string, input: CreateMomentInput): Promise<MomentResult<Moment>>;
  updateMoment(
    householdId: string,
    momentId: string,
    input: UpdateMomentInput,
  ): Promise<MomentResult<Moment>>;
  deleteMoment(householdId: string, momentId: string): Promise<MomentResult<void>>;
  respondToMoment(
    householdId: string,
    momentId: string,
    response: MomentRsvp,
  ): Promise<MomentResult<MomentParticipant>>;
  listExternalInvites(
    householdId: string,
    momentId: string,
  ): Promise<MomentResult<MomentExternalInvite[]>>;
  createExternalInvite(
    householdId: string,
    momentId: string,
    input: CreateExternalInviteInput,
  ): Promise<MomentResult<MomentExternalInvite>>;
}
