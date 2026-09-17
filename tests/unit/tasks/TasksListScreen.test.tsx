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
  navigate: vi.fn(),
}));

vi.mock('@presentation/tasks/hooks/useTasksList', () => ({ useTasksList: mocks.useTasksList }));
vi.mock('@presentation/tasks/hooks/useHouseholdTasks', () => ({
  useHouseholdTasks: mocks.useHouseholdTasks,
}));
vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));
vi.mock('@presentation/phrases/hooks/usePhrase', () => ({ usePhrase: mocks.usePhrase }));
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mocks.navigate }),
}));

import { TasksListScreen } from '@presentation/tasks/screens/TasksListScreen';
import { useHouseholdStore } from '@shared/store/householdStore';

const task = (id: string, title: string): Task => ({
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
  dueDate: '2026-09-20',
  completedAt: null,
  completedBy: null,
  approvedAt: null,
  approvedBy: null,
  requiresApproval: false,
  isOverdue: false,
  recurrence: 'NONE',
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
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

interface HouseholdResult {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  error: null;
  data: { tasks: Task[] } | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const given = (options: {
  householdId: string | null;
  householdTasks?: Task[];
  personalTasks?: Task[];
  householdData?: boolean;
  phrase?: string | null;
}): ReactTestRenderer => {
  const householdTasks = options.householdTasks ?? [];
  const personalTasks = options.personalTasks ?? [];

  useHouseholdStore.setState({
    activeHouseholdId: options.householdId,
    isHydrated: true,
    hasChosen: true,
  });
  mocks.useHouseholds.mockReturnValue({ data: [] });
  mocks.usePhrase.mockReturnValue({
    phrase:
      options.phrase === undefined || options.phrase === null
        ? null
        : { module: 'TASKS', context: 'DAY_START', text: options.phrase },
  });
  const householdResult: HouseholdResult = {
    tasks: householdTasks,
    isLoading: false,
    isError: false,
    error: null,
    data: options.householdData === false ? undefined : { tasks: householdTasks },
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  };
  mocks.useHouseholdTasks.mockReturnValue(householdResult);
  mocks.useTasksList.mockReturnValue({
    tasks: personalTasks,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
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
});

describe('TasksListScreen (P0-5)', () => {
  it('lists household tasks instead of hiding them', () => {
    const renderer = given({
      householdId: 'hh-1',
      householdTasks: [task('t1', 'Tarea del hogar')],
      personalTasks: [task('t2', 'Tarea personal')],
    });

    const text = textOf(renderer);
    expect(text).toContain('Del hogar');
    expect(text).toContain('Tarea del hogar');
    expect(text).toContain('Tarea personal');

    renderer.unmount();
  });

  it('asks for a household when none is active', () => {
    const renderer = given({ householdId: null, personalTasks: [task('t2', 'Tarea personal')] });

    expect(textOf(renderer)).toContain('Selecciona un hogar para ver sus tareas');

    renderer.unmount();
  });

  it('asks the phrase bank for a TASKS line, not a generic one', () => {
    const renderer = given({ householdId: 'hh-1' });

    expect(mocks.usePhrase).toHaveBeenCalledWith('TASKS', 'DAY_START');

    renderer.unmount();
  });

  it('shows the line from the phrase bank above the task sections', () => {
    const renderer = given({ householdId: 'hh-1', phrase: 'Hoy tienes tareas esperando.' });

    expect(textOf(renderer)).toContain('Hoy tienes tareas esperando.');

    renderer.unmount();
  });

  it('shows an empty state for the household section', () => {
    const renderer = given({ householdId: 'hh-1', householdTasks: [] });

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
});
