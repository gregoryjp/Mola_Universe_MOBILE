import { create } from 'zustand';

interface HouseholdState {
  /** `null` means "personal view" (no household scope). */
  activeHouseholdId: string | null;
  setActiveHousehold: (householdId: string | null) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  activeHouseholdId: null,
  setActiveHousehold: (activeHouseholdId) => set({ activeHouseholdId }),
}));
