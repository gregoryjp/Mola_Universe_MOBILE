import type { Household } from '@domain/households/entities/Household';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useHouseholds: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));
// `CreateHouseholdButton` resolves its own navigation; the real package pulls
// Flow-annotated `react-native` internals that do not parse in this env.
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mocks.navigate }),
}));

import { HouseholdHubScreen } from '@presentation/households/screens/HouseholdHubScreen';
import { useHouseholdStore } from '@shared/store/householdStore';

const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const textOf = (renderer: ReactTestRenderer): string => collectText(renderer.toJSON());

const findByTestID = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

/** Finds a node by the accessibility label it announces, the way a screen reader would. */
const findByLabel = (renderer: ReactTestRenderer, label: string) =>
  renderer.root.findAll((node) => node.props.accessibilityLabel === label)[0];

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const household = (id: string, name: string, memberCount: number): Household => ({
  id,
  name,
  description: null,
  ownerId: 'u1',
  memberCount,
  createdAt: '2026-01-01T00:00:00.000Z',
});

interface GivenOptions {
  households?: Household[];
  isLoading?: boolean;
  isError?: boolean;
  error?: { message: string } | null;
}

const given = (options: GivenOptions = {}): ReactTestRenderer => {
  useHouseholdStore.setState({
    activeHouseholdId: options.households?.length === 0 ? null : 'hh-1',
    isHydrated: true,
    hasChosen: true,
  });
  mocks.useHouseholds.mockReturnValue({
    data: options.households ?? [household('hh-1', 'Casa Gregory', 3)],
    isLoading: options.isLoading ?? false,
    isError: options.isError ?? false,
    error: options.error ?? null,
  });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HouseholdHubScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HouseholdHubScreen — Casa', () => {
  it('organises the household by intention, not as a grid of modules', () => {
    const renderer = given();

    for (const group of ['organize', 'buy-maintain', 'shared-money', 'family', 'manage']) {
      expect(findByTestID(renderer, `casa-group-${group}`)).toBeDefined();
    }

    renderer.unmount();
  });

  it('lists every already-built household capability exactly once', () => {
    const renderer = given();

    for (const key of [
      'tasks',
      'calendar',
      'shopping',
      'inventory',
      'expenses',
      'recurring',
      'savings',
      'pets',
      'moments',
    ]) {
      expect(findByTestID(renderer, `casa-${key}`)).toBeDefined();
    }

    renderer.unmount();
  });

  it('makes Inventario reachable — it had no entry point anywhere in the app', () => {
    const renderer = given();

    const row = findByTestID(renderer, 'casa-inventory');
    expect(row).toBeDefined();
    act(() => {
      row?.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('InventoryList');

    renderer.unmount();
  });

  it('makes Gastos recurrentes reachable from the household context', () => {
    const renderer = given();

    act(() => {
      findByTestID(renderer, 'casa-recurring')?.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('RecurringExpenses');

    renderer.unmount();
  });

  it('offers a way back to Hoy, so Casa is not a dead end', () => {
    const renderer = given();

    const back = findByLabel(renderer, 'Volver');
    expect(back).toBeDefined();

    act(() => {
      back?.props.onPress();
    });
    expect(navigation.goBack).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('keeps household creation inside Casa, not in every household screen', () => {
    const renderer = given();

    // The create action used to be a chip on the selector, which is mounted on
    // nine screens; it now lives in the hub's own "Gestión del hogar" group.
    act(() => {
      findByLabel(renderer, '+ Crear hogar')?.props.onPress();
    });
    expect(mocks.navigate).toHaveBeenCalledWith('CreateHousehold');

    renderer.unmount();
  });

  it('routes tab sections through the tab navigator instead of pushing a duplicate', () => {
    const renderer = given();

    act(() => {
      findByTestID(renderer, 'casa-tasks')?.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'TasksList' });

    act(() => {
      findByTestID(renderer, 'casa-shopping')?.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'ShoppingLists' });

    renderer.unmount();
  });

  it('opens the household setup, not an empty hub, when the user has no household', () => {
    const renderer = given({ households: [] });

    expect(findByTestID(renderer, 'casa-empty')).toBeDefined();
    expect(findByTestID(renderer, 'casa-group-organize')).toBeUndefined();
    expect(findByTestID(renderer, 'casa-inventory')).toBeUndefined();

    renderer.unmount();
  });

  it('points the setup empty state at the real create-household screen', () => {
    const renderer = given({ households: [] });

    act(() => {
      findByLabel(renderer, 'Crear un hogar')?.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('CreateHousehold');

    renderer.unmount();
  });

  it('shows the active household and keeps the switcher available', () => {
    const renderer = given();

    expect(textOf(renderer)).toContain('Casa Gregory');
    // The switcher is the "cambiar" half of household management.
    expect(findByLabel(renderer, 'Casa Gregory')).toBeDefined();

    renderer.unmount();
  });

  it('surfaces a failure instead of pretending the household list is empty', () => {
    const renderer = given({
      isError: true,
      error: { message: 'No se pudo cargar' },
    });

    expect(textOf(renderer)).toContain('No se pudo cargar');
    expect(findByTestID(renderer, 'casa-empty')).toBeUndefined();

    renderer.unmount();
  });
});
