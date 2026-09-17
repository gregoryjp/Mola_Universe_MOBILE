import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useMeowCapability: vi.fn(),
  useHouseholds: vi.fn(),
  useTasksList: vi.fn(),
  useHouseholdTasks: vi.fn(),
  usePersonalSavingsGoals: vi.fn(),
  useHouseholdSavingsGoals: vi.fn(),
  useShoppingLists: vi.fn(),
  mutate: vi.fn(),
  reset: vi.fn(),
}));

vi.mock('@presentation/meow/hooks/useMeowCapability', () => ({
  useMeowCapability: mocks.useMeowCapability,
}));
vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));
vi.mock('@presentation/tasks/hooks/useTasksList', () => ({ useTasksList: mocks.useTasksList }));
vi.mock('@presentation/tasks/hooks/useHouseholdTasks', () => ({
  useHouseholdTasks: mocks.useHouseholdTasks,
}));
vi.mock('@presentation/savings/hooks/useSavingsGoals', () => ({
  usePersonalSavingsGoals: mocks.usePersonalSavingsGoals,
  useHouseholdSavingsGoals: mocks.useHouseholdSavingsGoals,
}));
vi.mock('@presentation/shopping/hooks/useShoppingLists', () => ({
  useShoppingLists: mocks.useShoppingLists,
}));
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: vi.fn() }),
}));

import { MEOW_CAPABILITY_META } from '@presentation/meow/capabilities';
import { MeowScreen } from '@presentation/meow/screens/MeowScreen';
import { useHouseholdStore } from '@shared/store/householdStore';

interface ExecutionState {
  isPending?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  error?: { message: string } | null;
  data?: { capability: string; message: string; phrase: string | null } | undefined;
}

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

const byTestId = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

const render = (options?: {
  householdId?: string | null;
  execution?: ExecutionState;
}): ReactTestRenderer => {
  useHouseholdStore.setState({
    activeHouseholdId: options?.householdId === undefined ? 'hh-1' : options.householdId,
    isHydrated: true,
    hasChosen: true,
  });

  mocks.useMeowCapability.mockReturnValue({
    mutate: mocks.mutate,
    reset: mocks.reset,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    ...options?.execution,
  });
  mocks.useHouseholds.mockReturnValue({ data: [] });
  mocks.useTasksList.mockReturnValue({ tasks: [], isLoading: false });
  mocks.useHouseholdTasks.mockReturnValue({ tasks: [], isLoading: false });
  mocks.usePersonalSavingsGoals.mockReturnValue({ goals: [], isLoading: false });
  mocks.useHouseholdSavingsGoals.mockReturnValue({ goals: [], isLoading: false });
  mocks.useShoppingLists.mockReturnValue({ lists: [], isLoading: false });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<MeowScreen navigation={{} as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MeowScreen', () => {
  it('shows the 12 capabilities, no more and no less', () => {
    const renderer = render();
    const text = textOf(renderer);

    expect(MEOW_CAPABILITY_META).toHaveLength(12);
    for (const meta of MEOW_CAPABILITY_META) {
      expect(text).toContain(meta.label);
    }

    renderer.unmount();
  });

  it('runs a read-only capability with the active household', () => {
    const renderer = render({ householdId: 'hh-1' });

    act(() => {
      byTestId(renderer, 'meow-capability-VIEW_MY_DAY')?.props.onPress();
    });
    act(() => {
      byTestId(renderer, 'meow-VIEW_MY_DAY-submit')?.props.onPress();
    });

    expect(mocks.mutate).toHaveBeenCalledWith({
      capability: 'VIEW_MY_DAY',
      params: { householdId: 'hh-1' },
    });

    renderer.unmount();
  });

  it('blocks the capabilities that need a household when there is none', () => {
    const renderer = render({ householdId: null });

    const blocked = byTestId(renderer, 'meow-capability-VIEW_EXPENSE_BALANCE');
    expect(blocked?.props.onPress).toBeUndefined();
    expect(textOf(renderer)).toContain('Necesita un hogar activo');

    // The capability that does not need a household stays available.
    expect(byTestId(renderer, 'meow-capability-VIEW_MY_DAY')?.props.onPress).toBeTypeOf('function');

    renderer.unmount();
  });

  it('sends typed params for the create-task capability', () => {
    const renderer = render({ householdId: 'hh-1' });

    act(() => {
      byTestId(renderer, 'meow-capability-CREATE_TASK')?.props.onPress();
    });
    act(() => {
      byTestId(renderer, 'meow-CREATE_TASK-title')?.props.onChangeText('Comprar pan');
    });
    act(() => {
      byTestId(renderer, 'meow-CREATE_TASK-submit')?.props.onPress();
    });

    const todayIso = new Date().toISOString().slice(0, 10);
    expect(mocks.mutate).toHaveBeenCalledWith({
      capability: 'CREATE_TASK',
      params: {
        title: 'Comprar pan',
        dueDate: todayIso,
        category: 'GENERAL',
        priority: 'MEDIUM',
        householdId: 'hh-1',
      },
    });

    renderer.unmount();
  });

  it('shows the deterministic confirmation the backend returns', () => {
    const renderer = render({
      execution: {
        isSuccess: true,
        data: {
          capability: 'VIEW_MY_DAY',
          message: 'Hoy tienes 2 tareas y 1 evento.',
          phrase: 'Buen día para empezar.',
        },
      },
    });

    act(() => {
      byTestId(renderer, 'meow-capability-VIEW_MY_DAY')?.props.onPress();
    });

    const text = textOf(renderer);
    expect(text).toContain('Hoy tienes 2 tareas y 1 evento.');
    expect(text).toContain('Buen día para empezar.');

    renderer.unmount();
  });

  it('surfaces a capability error where the capability was run', () => {
    const renderer = render({
      execution: { isError: true, error: { message: 'Faltan datos' } },
    });

    act(() => {
      byTestId(renderer, 'meow-capability-VIEW_MY_DAY')?.props.onPress();
    });

    expect(textOf(renderer)).toContain('Faltan datos');

    renderer.unmount();
  });
});
