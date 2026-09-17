import type { Household } from '@domain/households/entities/Household';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useHouseholds: vi.fn(),
  auth: { isAuthenticated: true } as { isAuthenticated: boolean },
}));

vi.mock('@shared/store/authStore', () => ({
  useAuthStore: (selector: (state: typeof mocks.auth) => unknown) => selector(mocks.auth),
}));

vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));

import { useDefaultActiveHousehold } from '@presentation/households/hooks/useDefaultActiveHousehold';
import { useHouseholdStore } from '@shared/store/householdStore';

const household = (id: string): Household => ({
  id,
  name: `Hogar ${id}`,
  description: null,
  ownerId: 'u1',
  memberCount: 1,
  createdAt: '2026-09-17T09:00:00.000Z',
});

const render = (): ReactTestRenderer => {
  const Harness = (): null => {
    useDefaultActiveHousehold();
    return null;
  };
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<Harness />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const activeId = (): string | null => useHouseholdStore.getState().activeHouseholdId;

beforeEach(() => {
  mocks.useHouseholds.mockReset();
  mocks.auth.isAuthenticated = true;
  useHouseholdStore.setState({ activeHouseholdId: null, isHydrated: true, hasChosen: false });
});

describe('useDefaultActiveHousehold (P0-4)', () => {
  it('defaults to the first household when the user never chose one', () => {
    mocks.useHouseholds.mockReturnValue({ data: [household('hh-1'), household('hh-2')] });

    const renderer = render();

    expect(activeId()).toBe('hh-1');
    renderer.unmount();
  });

  it('respects a deliberate "Personal" choice', () => {
    useHouseholdStore.setState({ activeHouseholdId: null, isHydrated: true, hasChosen: true });
    mocks.useHouseholds.mockReturnValue({ data: [household('hh-1')] });

    const renderer = render();

    expect(activeId()).toBeNull();
    renderer.unmount();
  });

  it('keeps a choice the user already made', () => {
    useHouseholdStore.setState({ activeHouseholdId: 'hh-2', isHydrated: true, hasChosen: true });
    mocks.useHouseholds.mockReturnValue({ data: [household('hh-1'), household('hh-2')] });

    const renderer = render();

    expect(activeId()).toBe('hh-2');
    renderer.unmount();
  });

  it('replaces a stale household id that is not part of this account', () => {
    useHouseholdStore.setState({ activeHouseholdId: 'ghost', isHydrated: true, hasChosen: true });
    mocks.useHouseholds.mockReturnValue({ data: [household('hh-1')] });

    const renderer = render();

    expect(activeId()).toBe('hh-1');
    renderer.unmount();
  });

  it('waits for the persisted choice to be read', () => {
    useHouseholdStore.setState({ activeHouseholdId: null, isHydrated: false, hasChosen: false });
    mocks.useHouseholds.mockReturnValue({ data: [household('hh-1')] });

    const renderer = render();

    expect(activeId()).toBeNull();
    renderer.unmount();
  });

  it('does nothing while there is no session', () => {
    mocks.auth.isAuthenticated = false;
    mocks.useHouseholds.mockReturnValue({ data: [household('hh-1')] });

    const renderer = render();

    expect(activeId()).toBeNull();
    renderer.unmount();
  });

  it('does nothing when the user has no households', () => {
    mocks.useHouseholds.mockReturnValue({ data: [] });

    const renderer = render();

    expect(activeId()).toBeNull();
    renderer.unmount();
  });
});
