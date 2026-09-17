import { create } from 'zustand';

/** The persisted choice, as read from storage: `{ id: null }` means "Personal". */
export interface StoredActiveHousehold {
  id: string | null;
}

interface HouseholdState {
  /** `null` means "personal view" (no household scope). */
  activeHouseholdId: string | null;
  /** `true` once the persisted choice has been read from storage. */
  isHydrated: boolean;
  /**
   * `false` until the user picks a household (or a persisted choice is loaded).
   * Drives the default-to-first-household rule so it never overrides a real
   * choice (P0-4).
   */
  hasChosen: boolean;
  /**
   * Records the user's explicit choice. Persistence is wired separately in
   * `householdPersistence.ts`: importing storage here would drag
   * `expo-secure-store` → `react-native` into this module, and `react-native`
   * does not parse in the node test environment, so every hook test that uses
   * this store would fail to load.
   */
  setActiveHousehold: (householdId: string | null) => void;
  /** Applies a choice read from storage (or `null` when none was ever saved). */
  hydrate: (stored: StoredActiveHousehold | null) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  activeHouseholdId: null,
  isHydrated: false,
  hasChosen: false,
  setActiveHousehold: (activeHouseholdId) => set({ activeHouseholdId, hasChosen: true }),
  hydrate: (stored) =>
    set({
      activeHouseholdId: stored?.id ?? null,
      hasChosen: stored !== null,
      isHydrated: true,
    }),
}));
