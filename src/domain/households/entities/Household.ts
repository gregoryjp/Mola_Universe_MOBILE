/** Payload for `POST /households` (backend `CreateHouseholdSchema`). */
export interface CreateHouseholdInput {
  name: string;
  description?: string;
}

/** Mirrors the backend `IHouseholdDTO` (modules/households/interface/IHousehold.ts). */
export interface Household {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

/**
 * Mirrors the backend `IHouseholdMemberDTO`
 * (modules/households/interface/IHousehold.ts). `name` and `email` arrive
 * joined from `User` (backend TD-032), which is what lets a screen show a
 * person instead of an opaque `userId`.
 *
 * `role` stays a plain string on purpose: the backend DTO types it that way, so
 * a strict union here would silently drift the day the backend adds a role.
 */
export interface HouseholdMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}
