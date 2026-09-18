import type { HouseholdMember } from '@domain/households/entities/Household';
import type { Task } from '@domain/tasks/entities/Task';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useTasksList: vi.fn(),
  useHouseholdTasks: vi.fn(),
  useHouseholds: vi.fn(),
  usePhrase: vi.fn(),
  useCompleteTask: vi.fn(),
  useHouseholdMembers: vi.fn(),
  navigate: vi.fn(),
}));

/** Refetch spies, recreated per test so the call counts start at zero. */
const refetches = { household: vi.fn(), personal: vi.fn() };

vi.mock('@presentation/tasks/hooks/useTasksList', () => ({ useTasksList: mocks.useTasksList }));
vi.mock('@presentation/tasks/hooks/useHouseholdTasks', () => ({
  useHouseholdTasks: mocks.useHouseholdTasks,
}));
vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));
// Only the hook is faked: the real `memberNameById` stays under test.
vi.mock('@presentation/households/hooks/useHouseholdMembers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@presentation/households/hooks/useHouseholdMembers')>();
  return { ...actual, useHouseholdMembers: mocks.useHouseholdMembers };
});
vi.mock('@presentation/phrases/hooks/usePhrase', () => ({ usePhrase: mocks.usePhrase }));
vi.mock('@presentation/tasks/hooks/useTaskMutations', () => ({
  useCompleteTask: mocks.useCompleteTask,
}));
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mocks.navigate }),
}));

import { TasksListScreen } from '@presentation/tasks/screens/TasksListScreen';
import { useHouseholdStore } from '@shared/store/householdStore';

/** Built relative to the real clock so the grouping assertions never depend on
 * the calendar date the suite happens to run on. */
const isoInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const task = (id: string, title: string, overrides: Partial<Task> = {}): Task => ({
  id,
  createdBy: 'u1',
  assignedTo: null,
  title,
  description: null,
  scope: 'HOUSEHOLD',
  householdId: 'hh-1',
  category: 'GENERAL',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate: isoInDays(0),
  completedAt: null,
  completedBy: null,
  approvedAt: null,
  approvedBy: null,
  requiresApproval: false,
  isOverdue: false,
  recurrence: 'NONE',
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
  ...overrides,
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

const findByTestID = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

interface HouseholdResult {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  error: null | { code: string; message: string };
  data: { tasks: Task[] } | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

interface GivenOptions {
  householdId?: string | null;
  householdTasks?: Task[];
  personalTasks?: Task[];
  householdData?: boolean;
  householdError?: { code: string; message: string } | null;
  phrase?: string | null;
  members?: HouseholdMember[];
}

const given = (options: GivenOptions = {}): ReactTestRenderer => {
  const householdTasks = options.householdTasks ?? [];
  const personalTasks = options.personalTasks ?? [];

  useHouseholdStore.setState({
    // A deliberate `null` must survive, so the default is not applied with `??`.
    activeHouseholdId: options.householdId === undefined ? 'hh-1' : options.householdId,
    isHydrated: true,
    hasChosen: true,
  });
  mocks.useHouseholds.mockReturnValue({ data: [] });
  mocks.useHouseholdMembers.mockReturnValue({ members: options.members ?? [] });
  mocks.usePhrase.mockReturnValue({
    phrase:
      options.phrase === undefined || options.phrase === null
        ? null
        : { module: 'TASKS', context: 'DAY_START', text: options.phrase },
  });
  const householdResult: HouseholdResult = {
    tasks: householdTasks,
    isLoading: false,
    isError: options.householdError !== undefined && options.householdError !== null,
    error: options.householdError ?? null,
    data: options.householdData === false ? undefined : { tasks: householdTasks },
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
    fetchNextPage: vi.fn(),
    refetch: refetches.household,
  };
  mocks.useHouseholdTasks.mockReturnValue(householdResult);
  mocks.useTasksList.mockReturnValue({
    tasks: personalTasks,
    isLoading: false,
    isError: false,
    error: null,
    refetch: refetches.personal,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
    data: { pages: [] },
  });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<TasksListScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
  refetches.household = vi.fn();
  refetches.personal = vi.fn();
  mocks.useCompleteTask.mockReturnValue({ mutate: vi.fn(), isPending: false });
});

describe('TasksListScreen (P0-5)', () => {
  it('lists household tasks instead of hiding them', () => {
    const renderer = given({
      householdId: 'hh-1',
      householdTasks: [task('t1', 'Tarea del hogar')],
      personalTasks: [task('t2', 'Tarea personal', { scope: 'PERSONAL', householdId: null })],
    });

    const text = textOf(renderer);
    expect(text).toContain('Tarea del hogar');
    expect(text).toContain('Tarea personal');

    renderer.unmount();
  });

  it('shows the assignee name for a task assigned to a household member', () => {
    const renderer = given({
      householdId: 'hh-1',
      householdTasks: [task('t1', 'Regar plantas', { assignedTo: 'u2' })],
      members: [
        {
          id: 'm1',
          userId: 'u2',
          name: 'Ana',
          email: 'ana@example.com',
          role: 'MEMBER',
          joinedAt: '2026-09-17T09:00:00.000Z',
        },
      ],
    });

    expect(textOf(renderer)).toContain('Ana');

    renderer.unmount();
  });

  it('falls back to neutral copy when the assignee is not a known member', () => {
    const renderer = given({
      householdId: 'hh-1',
      householdTasks: [task('t1', 'Regar plantas', { assignedTo: 'ghost' })],
      members: [],
    });

    // The raw id must never leak into the UI.
    expect(textOf(renderer)).not.toContain('ghost');

    renderer.unmount();
  });

  it('asks for a household when none is active', () => {
    const renderer = given({
      householdId: null,
      personalTasks: [task('t2', 'Tarea personal', { scope: 'PERSONAL', householdId: null })],
    });

    expect(textOf(renderer)).toContain('Selecciona un hogar para ver sus tareas');

    renderer.unmount();
  });

  it('asks the phrase bank for a TASKS line, not a generic one', () => {
    const renderer = given();

    expect(mocks.usePhrase).toHaveBeenCalledWith('TASKS', 'DAY_START');

    renderer.unmount();
  });

  it('shows the line from the phrase bank above the task groups', () => {
    const renderer = given({ phrase: 'Hoy tienes tareas esperando.' });

    expect(textOf(renderer)).toContain('Hoy tienes tareas esperando.');

    renderer.unmount();
  });

  it('shows an empty state when the household filter finds nothing', () => {
    const renderer = given({ householdId: 'hh-1', householdTasks: [] });

    act(() => {
      findByTestID(renderer, 'tasks-filter-HOUSEHOLD')?.props.onPress();
    });

    expect(textOf(renderer)).toContain('Sin tareas de hogar todavía');

    renderer.unmount();
  });

  it('opens the detail of a household task', () => {
    const renderer = given({
      householdId: 'hh-1',
      householdTasks: [task('t1', 'Tarea del hogar')],
    });

    const row = renderer.root.findAll(
      (node) => node.props.accessibilityLabel === 'Tarea del hogar',
    )[0];
    expect(row).toBeDefined();
    act(() => {
      row?.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('TaskDetail', { taskId: 't1' });

    renderer.unmount();
  });

  describe('grouping', () => {
    it('groups by real dates and skips the groups that are empty', () => {
      const renderer = given({
        householdTasks: [
          task('t-today', 'Para hoy', { dueDate: isoInDays(0) }),
          task('t-tomorrow', 'Para mañana', { dueDate: isoInDays(1) }),
          task('t-upcoming', 'Más adelante', { dueDate: isoInDays(6) }),
        ],
      });

      expect(findByTestID(renderer, 'tasks-group-today')).toBeDefined();
      expect(findByTestID(renderer, 'tasks-group-tomorrow')).toBeDefined();
      expect(findByTestID(renderer, 'tasks-group-upcoming')).toBeDefined();
      // No completed task in the fixture, so the group must not be drawn at all.
      expect(findByTestID(renderer, 'tasks-group-completed')).toBeUndefined();

      renderer.unmount();
    });

    it('keeps overdue work with today rather than in a group of its own', () => {
      const renderer = given({
        householdTasks: [task('t-late', 'Se me pasó', { dueDate: isoInDays(-3), isOverdue: true })],
      });

      expect(findByTestID(renderer, 'tasks-group-today')).toBeDefined();
      expect(textOf(renderer)).toContain('Atrasada');

      renderer.unmount();
    });

    it('drops cancelled tasks — they are not actionable', () => {
      const renderer = given({
        householdTasks: [task('t-cancelled', 'Cancelada', { status: 'CANCELLED' })],
      });

      expect(textOf(renderer)).not.toContain('Cancelada');

      renderer.unmount();
    });
  });

  describe('completing a task', () => {
    it('persists through the real mutation instead of faking the state', () => {
      const mutate = vi.fn();
      mocks.useCompleteTask.mockReturnValue({ mutate, isPending: false });
      const renderer = given({ householdTasks: [task('t1', 'Sacar la basura')] });

      act(() => {
        findByTestID(renderer, 'task-t1-complete')?.props.onPress();
      });

      expect(mutate).toHaveBeenCalledWith({ taskId: 't1' }, expect.anything());

      renderer.unmount();
    });

    it('blocks a second tap while the first is in flight', () => {
      // Never resolves: the control stays in its pending state.
      mocks.useCompleteTask.mockReturnValue({ mutate: vi.fn(), isPending: true });
      const renderer = given({ householdTasks: [task('t1', 'Sacar la basura')] });

      act(() => {
        findByTestID(renderer, 'task-t1-complete')?.props.onPress();
      });

      const control = findByTestID(renderer, 'task-t1-complete');
      expect(control?.props.accessibilityState.disabled).toBe(true);

      renderer.unmount();
    });

    it('rolls back and says so when the server refuses', () => {
      const mutate = vi.fn((_vars, options?: { onError?: (error: Error) => void }) => {
        options?.onError?.(new Error('boom'));
      });
      mocks.useCompleteTask.mockReturnValue({ mutate, isPending: false });
      const renderer = given({ householdTasks: [task('t1', 'Sacar la basura')] });

      act(() => {
        findByTestID(renderer, 'task-t1-complete')?.props.onPress();
      });

      expect(textOf(renderer)).toContain('No se pudo completar');
      expect(findByTestID(renderer, 'task-t1-complete')?.props.accessibilityState.disabled).toBe(
        false,
      );

      renderer.unmount();
    });
  });

  describe('refreshing', () => {
    const pullToRefresh = (renderer: ReactTestRenderer): void => {
      const scroll = findByTestID(renderer, 'tasks-scroll');
      act(() => {
        scroll?.props.refreshControl.props.onRefresh();
      });
    };

    it('refetches both visible sources when the list is pulled', () => {
      const renderer = given({ householdTasks: [task('t1', 'Sacar la basura')] });

      pullToRefresh(renderer);

      expect(refetches.household).toHaveBeenCalledTimes(1);
      expect(refetches.personal).toHaveBeenCalledTimes(1);

      renderer.unmount();
    });

    it('leaves a filtered-out source alone', () => {
      const renderer = given({ householdTasks: [task('t1', 'Sacar la basura')] });

      act(() => {
        findByTestID(renderer, 'tasks-filter-PERSONAL')?.props.onPress();
      });
      pullToRefresh(renderer);

      expect(refetches.personal).toHaveBeenCalledTimes(1);
      expect(refetches.household).not.toHaveBeenCalled();

      renderer.unmount();
    });
  });

  describe('creating a task from the list', () => {
    it('opens the quick create from the + button, not the full form', () => {
      const renderer = given({ householdId: 'hh-1' });

      act(() => {
        findByTestID(renderer, 'tasks-fab')?.props.onPress();
      });

      expect(navigation.navigate).toHaveBeenCalledWith('QuickTaskCreate', undefined);

      renderer.unmount();
    });

    it('opens the quick create from the empty state', () => {
      const renderer = given({ householdId: 'hh-1', householdTasks: [] });

      act(() => {
        findByTestID(renderer, 'tasks-empty')?.props.onAction();
      });

      expect(navigation.navigate).toHaveBeenCalledWith('QuickTaskCreate', undefined);

      renderer.unmount();
    });

    // The list already knows the answer, so the quick create must not ask again.
    it('passes the scope the user is filtering by', () => {
      const renderer = given({ householdId: 'hh-1' });

      act(() => {
        findByTestID(renderer, 'tasks-filter-HOUSEHOLD')?.props.onPress();
      });
      act(() => {
        findByTestID(renderer, 'tasks-fab')?.props.onPress();
      });

      expect(navigation.navigate).toHaveBeenCalledWith('QuickTaskCreate', { scope: 'HOUSEHOLD' });

      renderer.unmount();
    });

    it('passes the personal scope when that is the filter', () => {
      const renderer = given({ householdId: 'hh-1' });

      act(() => {
        findByTestID(renderer, 'tasks-filter-PERSONAL')?.props.onPress();
      });
      act(() => {
        findByTestID(renderer, 'tasks-fab')?.props.onPress();
      });

      expect(navigation.navigate).toHaveBeenCalledWith('QuickTaskCreate', { scope: 'PERSONAL' });

      renderer.unmount();
    });
  });
});
