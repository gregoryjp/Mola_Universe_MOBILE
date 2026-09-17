import { useAuthStore } from '@shared/store/authStore';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useEffect } from 'react';
import { useHouseholds } from './useHouseholds';

/**
 * Gives the app a sensible active household (P0-4). Before this, `activeHouseholdId`
 * started at `null` and only ever changed when the user tapped the chip, so every
 * household-scoped screen opened empty.
 *
 * Runs once the persisted choice has been read, and only when the user never
 * picked one — or picked one that belongs to somebody else (a stale id from a
 * previous account, or a household the user left). A deliberate "Personal"
 * choice (`hasChosen` with a null id) is respected.
 */
export const useDefaultActiveHousehold = (): void => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useHouseholdStore((state) => state.isHydrated);
  const activeHouseholdId = useHouseholdStore((state) => state.activeHouseholdId);
  const hasChosen = useHouseholdStore((state) => state.hasChosen);
  const setActiveHousehold = useHouseholdStore((state) => state.setActiveHousehold);
  const { data: households } = useHouseholds({ enabled: isAuthenticated });

  useEffect(() => {
    if (!isAuthenticated || !isHydrated || !households) return;
    const [firstHousehold] = households;
    if (!firstHousehold) return;
    const isKnownChoice =
      activeHouseholdId !== null &&
      households.some((household) => household.id === activeHouseholdId);
    if (isKnownChoice) return;
    if (activeHouseholdId === null && hasChosen) return;
    setActiveHousehold(firstHousehold.id);
  }, [isAuthenticated, isHydrated, households, activeHouseholdId, hasChosen, setActiveHousehold]);
};
