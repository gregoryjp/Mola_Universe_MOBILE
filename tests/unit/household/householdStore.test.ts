import { useHouseholdStore } from '@shared/store/householdStore';
import { beforeEach, describe, expect, it } from 'vitest';

const reset = (): void => {
  useHouseholdStore.setState({ activeHouseholdId: null, isHydrated: false, hasChosen: false });
};

describe('householdStore (P0-4)', () => {
  beforeEach(reset);

  it('starts with no household, not hydrated and no choice', () => {
    const state = useHouseholdStore.getState();

    expect(state.activeHouseholdId).toBeNull();
    expect(state.isHydrated).toBe(false);
    expect(state.hasChosen).toBe(false);
  });

  it('records an explicit household choice', () => {
    useHouseholdStore.getState().setActiveHousehold('hh-1');

    expect(useHouseholdStore.getState().activeHouseholdId).toBe('hh-1');
    expect(useHouseholdStore.getState().hasChosen).toBe(true);
  });

  it('records "Personal" (null) as a real choice, not as "never chose"', () => {
    useHouseholdStore.getState().setActiveHousehold('hh-1');
    useHouseholdStore.getState().setActiveHousehold(null);

    expect(useHouseholdStore.getState().activeHouseholdId).toBeNull();
    expect(useHouseholdStore.getState().hasChosen).toBe(true);
  });

  it('hydrates with no stored value as "never chose"', () => {
    useHouseholdStore.getState().hydrate(null);

    expect(useHouseholdStore.getState().isHydrated).toBe(true);
    expect(useHouseholdStore.getState().activeHouseholdId).toBeNull();
    expect(useHouseholdStore.getState().hasChosen).toBe(false);
  });

  it('hydrates a stored household as a choice', () => {
    useHouseholdStore.getState().hydrate({ id: 'hh-7' });

    expect(useHouseholdStore.getState().isHydrated).toBe(true);
    expect(useHouseholdStore.getState().activeHouseholdId).toBe('hh-7');
    expect(useHouseholdStore.getState().hasChosen).toBe(true);
  });

  it('hydrates a stored "Personal" value as a choice with no household', () => {
    useHouseholdStore.getState().hydrate({ id: null });

    expect(useHouseholdStore.getState().isHydrated).toBe(true);
    expect(useHouseholdStore.getState().activeHouseholdId).toBeNull();
    expect(useHouseholdStore.getState().hasChosen).toBe(true);
  });
});
