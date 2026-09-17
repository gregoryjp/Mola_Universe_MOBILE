import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadActiveHouseholdId: vi.fn(),
  saveActiveHouseholdId: vi.fn(),
}));

vi.mock('@shared/utils/householdStorage', () => ({
  loadActiveHouseholdId: mocks.loadActiveHouseholdId,
  saveActiveHouseholdId: mocks.saveActiveHouseholdId,
}));

import { useHouseholdStore } from '@shared/store/householdStore';
// Importing the module arms the persistence subscriber.
import { hydrateActiveHousehold } from '@shared/store/householdPersistence';

const reset = (): void => {
  useHouseholdStore.setState({ activeHouseholdId: null, isHydrated: false, hasChosen: false });
};

beforeEach(() => {
  vi.clearAllMocks();
  reset();
  mocks.loadActiveHouseholdId.mockResolvedValue(null);
  mocks.saveActiveHouseholdId.mockResolvedValue(undefined);
});

describe('household persistence (P0-4)', () => {
  it('applies the persisted choice to the store on start', async () => {
    mocks.loadActiveHouseholdId.mockResolvedValue({ id: 'hh-3' });

    await hydrateActiveHousehold();

    expect(useHouseholdStore.getState().activeHouseholdId).toBe('hh-3');
    expect(useHouseholdStore.getState().hasChosen).toBe(true);
    expect(useHouseholdStore.getState().isHydrated).toBe(true);
  });

  it('does not write back what it just read', async () => {
    mocks.loadActiveHouseholdId.mockResolvedValue({ id: 'hh-3' });

    await hydrateActiveHousehold();

    expect(mocks.saveActiveHouseholdId).not.toHaveBeenCalled();
  });

  it('marks "never chose" when storage is empty', async () => {
    await hydrateActiveHousehold();

    expect(useHouseholdStore.getState().hasChosen).toBe(false);
    expect(useHouseholdStore.getState().isHydrated).toBe(true);
    expect(mocks.saveActiveHouseholdId).not.toHaveBeenCalled();
  });

  it('persists an explicit household choice', async () => {
    await hydrateActiveHousehold();

    useHouseholdStore.getState().setActiveHousehold('hh-9');

    expect(mocks.saveActiveHouseholdId).toHaveBeenCalledWith('hh-9');
  });

  it('persists an explicit return to "Personal"', async () => {
    mocks.loadActiveHouseholdId.mockResolvedValue({ id: 'hh-9' });
    await hydrateActiveHousehold();

    useHouseholdStore.getState().setActiveHousehold(null);

    expect(mocks.saveActiveHouseholdId).toHaveBeenCalledWith(null);
  });

  it('does not write when the choice is unchanged', async () => {
    await hydrateActiveHousehold();

    useHouseholdStore.getState().setActiveHousehold('hh-9');
    useHouseholdStore.getState().setActiveHousehold('hh-9');

    expect(mocks.saveActiveHouseholdId).toHaveBeenCalledTimes(1);
  });
});
