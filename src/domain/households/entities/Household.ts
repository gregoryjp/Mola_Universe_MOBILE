/** Mirrors the backend `IHouseholdDTO` (modules/households/interface/IHousehold.ts). */
export interface Household {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}
