import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useRecurringExpenses: vi.fn(),
  archive: vi.fn(),
  useHouseholdMembers: vi.fn(),
}));

vi.mock('@presentation/expenses/recurring/hooks/useRecurringExpenses', () => ({
  useRecurringExpenses: mocks.useRecurringExpenses,
}));
vi.mock('@presentation/expenses/recurring/hooks/useRecurringExpenseMutations', () => ({
  useArchiveRecurringExpense: () => ({ mutate: mocks.archive, isError: false, error: null }),
}));
// Only the hook is faked: the real `memberNameById` stays under test.
vi.mock('@presentation/households/hooks/useHouseholdMembers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@presentation/households/hooks/useHouseholdMembers')>();
  return { ...actual, useHouseholdMembers: mocks.useHouseholdMembers };
});
vi.mock('@shared/store/authStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({ user: { id: 'u1' } }),
}));

import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import { RecurringExpensesListScreen } from '@presentation/expenses/recurring/screens/RecurringExpensesListScreen';
import { useHouseholdStore } from '@shared/store/householdStore';

const expense = (currentTurnUserId: string | null): RecurringExpense => ({
  id: 'r1',
  householdId: 'h1',
  name: 'Papel higiénico',
  category: 'Baño',
  currency: 'EUR',
  lastPurchasedBy: null,
  lastPurchasedAt: null,
  currentTurnUserId,
  createdAt: '2026-09-17T09:00:00.000Z',
});

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

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

interface GivenOptions {
  householdId?: string | null;
  expenses?: RecurringExpense[];
  members?: {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
  }[];
}

const given = (options: GivenOptions = {}): ReactTestRenderer => {
  useHouseholdStore.setState({
    activeHouseholdId: options.householdId === undefined ? 'hh-1' : options.householdId,
    isHydrated: true,
    hasChosen: true,
  });
  mocks.useRecurringExpenses.mockReturnValue({
    data: options.expenses ?? [],
    isLoading: false,
    isError: false,
    error: null,
  });
  mocks.useHouseholdMembers.mockReturnValue({ members: options.members ?? [] });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <RecurringExpensesListScreen navigation={navigation as never} route={{} as never} />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecurringExpensesListScreen turn wiring (TD-024)', () => {
  it('asks for the members of the active household', () => {
    const renderer = given();

    expect(mocks.useHouseholdMembers).toHaveBeenCalledWith('hh-1');

    renderer.unmount();
  });

  it('resolves the turn to a member name using the real member list', () => {
    const renderer = given({
      expenses: [expense('u2')],
      members: [
        {
          id: 'm2',
          userId: 'u2',
          name: 'Ana',
          email: 'ana@ejemplo.com',
          role: 'MEMBER',
          joinedAt: '2026-09-15T00:00:00.000Z',
        },
      ],
    });

    const text = textOf(renderer);
    expect(text).toContain('Le toca a Ana');
    expect(text).not.toContain('Le toca a otro miembro');

    renderer.unmount();
  });

  it('keeps the neutral copy when the member list is still empty', () => {
    const renderer = given({ expenses: [expense('u2')], members: [] });

    expect(textOf(renderer)).toContain('Le toca a otro miembro');

    renderer.unmount();
  });

  it('does not request members without an active household', () => {
    const renderer = given({ householdId: null });

    expect(mocks.useHouseholdMembers).toHaveBeenCalledWith(null);
    expect(textOf(renderer)).toContain('Selecciona un hogar');

    renderer.unmount();
  });
});
