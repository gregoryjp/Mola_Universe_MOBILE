import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useHouseholdSavingsGoals: vi.fn(),
  usePersonalSavingsGoals: vi.fn(),
  useHouseholds: vi.fn(),
  usePhrase: vi.fn(),
}));

vi.mock('@presentation/savings/hooks/useSavingsGoals', () => ({
  useHouseholdSavingsGoals: mocks.useHouseholdSavingsGoals,
  usePersonalSavingsGoals: mocks.usePersonalSavingsGoals,
}));
vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));
vi.mock('@presentation/phrases/hooks/usePhrase', () => ({ usePhrase: mocks.usePhrase }));
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: vi.fn() }),
}));

import { SavingsScreen } from '@presentation/savings/screens/SavingsScreen';
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

const emptyGoals = () => ({
  goals: [],
  isLoading: false,
  isError: false,
  error: null,
  data: undefined,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
});

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

interface GivenOptions {
  householdId: string | null;
  phrase?: string | null;
}

const given = (options: GivenOptions): ReactTestRenderer => {
  useHouseholdStore.setState({
    activeHouseholdId: options.householdId,
    isHydrated: true,
    hasChosen: true,
  });
  mocks.useHouseholds.mockReturnValue({ data: [] });
  mocks.useHouseholdSavingsGoals.mockReturnValue(emptyGoals());
  mocks.usePersonalSavingsGoals.mockReturnValue(emptyGoals());
  mocks.usePhrase.mockReturnValue({
    phrase:
      options.phrase === undefined || options.phrase === null
        ? null
        : { module: 'SAVINGS', context: 'DAY_START', text: options.phrase },
  });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<SavingsScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SavingsScreen phrase integration', () => {
  it('asks the phrase bank for a SAVINGS line, not a generic one', () => {
    const renderer = given({ householdId: 'hh-1' });

    expect(mocks.usePhrase).toHaveBeenCalledWith('SAVINGS', 'DAY_START');

    renderer.unmount();
  });

  it('shows the line from the phrase bank above the goal sections', () => {
    const renderer = given({
      householdId: 'hh-1',
      phrase: 'Hoy es un buen día para acercarte a tu meta de ahorro.',
    });

    expect(textOf(renderer)).toContain('Hoy es un buen día para acercarte a tu meta de ahorro.');

    renderer.unmount();
  });

  it('keeps the screen unchanged when the bank has nothing to say', () => {
    const renderer = given({ householdId: 'hh-1' });

    const text = textOf(renderer);
    expect(text).toContain('Ahorros');
    expect(text).toContain('Del hogar');
    expect(text).toContain('Personales');

    renderer.unmount();
  });
});
