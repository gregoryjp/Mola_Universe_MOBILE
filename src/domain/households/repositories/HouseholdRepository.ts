import type { CreateHouseholdInput, Household } from '../entities/Household';

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
}
