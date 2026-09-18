import type { Household } from '@domain/households/entities/Household';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useHouseholds: vi.fn(),
}));

vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));

import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import { useHouseholdStore } from '@shared/store/householdStore';

const household = (id: string, name: string, memberCount: number): Household => ({
  id,
  name,
  description: null,
  ownerId: 'u1',
  memberCount,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const collectText = (node: unknown): string => {
  if (node === null || node === undefined || typeof node !== 'object') return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectText).join(' ');
  const withChildren = node as { children?: unknown };
  return collectText(withChildren.children);
};

const findByLabel = (renderer: ReactTestRenderer, label: string): ReactTestInstance | undefined =>
  renderer.root.findAll((node) => node.props.accessibilityLabel === label)[0];

const given = (households: Household[]): ReactTestRenderer => {
  useHouseholdStore.setState({
    activeHouseholdId: 'hh-1',
    isHydrated: true,
    hasChosen: true,
  });
  mocks.useHouseholds.mockReturnValue({ data: households, isLoading: false, isError: false });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HouseholdSelector />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HouseholdSelector', () => {
  it('offers the Personal scope plus one chip per household', () => {
    const renderer = given([household('hh-1', 'Casa Gregory', 3)]);

    expect(findByLabel(renderer, 'Personal')).toBeDefined();
    expect(findByLabel(renderer, 'Casa Gregory')).toBeDefined();

    renderer.unmount();
  });

  it('switches the active household when a chip is pressed', () => {
    const renderer = given([
      household('hh-1', 'Casa Gregory', 3),
      household('hh-2', 'Casa Ana', 2),
    ]);

    act(() => {
      findByLabel(renderer, 'Casa Ana')?.props.onPress();
    });

    expect(useHouseholdStore.getState().activeHouseholdId).toBe('hh-2');

    renderer.unmount();
  });

  it('does not offer household creation — it is mounted on nine screens', () => {
    const renderer = given([household('hh-1', 'Casa Gregory', 3)]);

    // Creating a household is household management: it belongs to Casa, not to
    // the selector that Inventory, Shopping, Tasks and Expenses all embed.
    expect(collectText(renderer.toJSON())).not.toContain('Crear hogar');

    renderer.unmount();
  });
});
