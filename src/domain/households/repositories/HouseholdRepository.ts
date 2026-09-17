import type { CreateHouseholdInput, Household, HouseholdMember } from '../entities/Household';

export interface HouseholdError {
  code: string;
  message: string;
  statusCode: number;
}

export type HouseholdResult<T> =
  | { success: true; value: T }
  | { success: false; error: HouseholdError };

/** Households port — backed by the verified `GET`/`POST /households` routes. */
export interface HouseholdRepository {
  listMyHouseholds(): Promise<HouseholdResult<Household[]>>;
  createHousehold(input: CreateHouseholdInput): Promise<HouseholdResult<Household>>;
  /** `GET /households/:householdId/members` — 200 with the array raw. */
  listMembers(householdId: string): Promise<HouseholdResult<HouseholdMember[]>>;
}
