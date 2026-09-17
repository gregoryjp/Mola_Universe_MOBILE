import { loadActiveHouseholdId, saveActiveHouseholdId } from '@shared/utils/householdStorage';
import { useHouseholdStore } from './householdStore';

/**
 * Persistence side of the active household (P0-4), kept out of the store so the
 * store stays importable from the node test environment.
 *
 * Importing this module arms the subscriber below, which writes the choice to
 * storage on every real change. `isHydrating` suppresses the write that the read
 * itself would otherwise echo back.
 */
let isHydrating = false;

useHouseholdStore.subscribe((state, previousState) => {
  if (isHydrating) return;
  if (!state.hasChosen) return;
  if (state.activeHouseholdId === previousState.activeHouseholdId) return;
  void saveActiveHouseholdId(state.activeHouseholdId);
});

/** Loads the persisted household choice on app start. */
export const hydrateActiveHousehold = async (): Promise<void> => {
  const stored = await loadActiveHouseholdId();
  isHydrating = true;
  useHouseholdStore.getState().hydrate(stored);
  isHydrating = false;
};
