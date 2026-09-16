// Mirrors the backend household payload (modules/households/interface/IHousehold.ts).

export interface HouseholdDto {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

/** Request body for `POST /households` (backend `CreateHouseholdSchema`). */
export interface CreateHouseholdRequestDto {
  name: string;
  description?: string;
}
