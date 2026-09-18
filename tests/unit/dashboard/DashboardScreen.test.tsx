import type { Task } from '@domain/tasks/entities/Task';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useDashboardSummary: vi.fn(),
  useHouseholds: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@presentation/dashboard/hooks/useDashboardSummary', () => ({
  useDashboardSummary: mocks.useDashboardSummary,
}));
vi.mock('@presentation/households/hooks/useHouseholds', () => ({
  useHouseholds: mocks.useHouseholds,
}));
// Mocked as a selector rather than imported for real: the store pulls
// `expo-secure-store`, whose Flow-annotated `react-native` internals do not
// parse in this node test environment.
vi.mock('@shared/store/authStore', () => ({
  useAuthStore: (selector: (state: { user: { name: string } | null }) => unknown) =>
    selector({ user: { name: 'Gregory Ríos' } }),
}));

import { DashboardScreen } from '@presentation/dashboard/screens/DashboardScreen';
import { useHouseholdStore } from '@shared/store/householdStore';

const task = (id: string, title: string, status: Task['status'] = 'PENDING'): Task => ({
  id,
  createdBy: 'u1',
  assignedTo: null,
  title,
  description: null,
  scope: 'HOUSEHOLD',
  householdId: 'hh-1',
  category: 'GENERAL',
  priority: 'MEDIUM',
  status,
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

/** Same flattening, for a single node rather than the whole tree. Yields `''` for
 * a missing node, so the `toContain` assertions that follow still fail loudly. */
const textOfNode = (instance: ReactTestInstance | undefined): string =>
  instance ? collectText(instance.children) : '';

const findByTestID = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const EMPTY_SUMMARY = {
  householdId: 'hh-1',
  date: '2026-09-17',
  tasksToday: [] as Task[],
  eventsToday: [] as never[],
  openShoppingLists: [] as never[],
  recentExpenses: [],
  meowSummary: '',
};

interface GivenOptions {
  summary?: Partial<typeof EMPTY_SUMMARY>;
  isLoading?: boolean;
  isError?: boolean;
  error?: { code: string; message: string } | null;
  isRefetching?: boolean;
  households?: { id: string; name: string; memberCount: number }[] | undefined;
  householdId?: string | null;
}

const given = (options: GivenOptions = {}): ReactTestRenderer => {
  useHouseholdStore.setState({
    // `??` would swallow the deliberate `null` (no active household), so the
    // default only applies when the option was not passed at all.
    activeHouseholdId: options.householdId === undefined ? 'hh-1' : options.householdId,
    isHydrated: true,
    hasChosen: true,
  });

  const hasSummary = !(options.isLoading || options.isError);
  mocks.useDashboardSummary.mockReturnValue({
    data: hasSummary ? { ...EMPTY_SUMMARY, ...options.summary } : undefined,
    isLoading: options.isLoading ?? false,
    isError: options.isError ?? false,
    error: options.error ?? null,
    refetch: vi.fn(),
    isRefetching: options.isRefetching ?? false,
  });
  mocks.useHouseholds.mockReturnValue({
    data: options.households ?? [{ id: 'hh-1', name: 'Casa Gregory', memberCount: 3 }],
  });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<DashboardScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardScreen — Hoy', () => {
  it('greets the real hydrated user, shortened to the first name', () => {
    const renderer = given();

    const text = textOf(renderer);
    expect(text).toContain('Gregory');
    expect(text).not.toContain('Ríos');
    expect(text).toMatch(/Buen/);

    renderer.unmount();
  });

  it('renders the date before any data arrives, so it survives offline', () => {
    const renderer = given({ isLoading: true });

    expect(textOf(renderer)).toMatch(
      /de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/,
    );

    renderer.unmount();
  });

  it('summarises the day from real counts, not from KPI tiles', () => {
    const renderer = given({
      summary: {
        tasksToday: [task('t1', 'Uno'), task('t2', 'Dos'), task('t3', 'Tres')],
        eventsToday: [
          { id: 'e1', title: 'Cita', type: 'APPOINTMENT', startAt: '', endAt: null },
        ] as never[],
      },
    });

    expect(textOfNode(findByTestID(renderer, 'hoy-day-summary'))).toContain('3 tareas');
    expect(textOfNode(findByTestID(renderer, 'hoy-day-summary'))).toContain('1 evento');

    renderer.unmount();
  });

  it('keeps completed tasks out of the day list', () => {
    const renderer = given({
      summary: { tasksToday: [task('done', 'Ya hecha', 'COMPLETED'), task('t2', 'Pendiente')] },
    });

    const text = textOf(renderer);
    expect(text).toContain('Pendiente');
    expect(text).not.toContain('Ya hecha');

    renderer.unmount();
  });

  it('shows an empty state instead of pretending there is content', () => {
    const renderer = given();

    expect(findByTestID(renderer, 'hoy-empty')).toBeDefined();
    expect(textOf(renderer)).toContain('Hoy no tienes nada programado.');

    renderer.unmount();
  });

  it('distinguishes offline from a server error', () => {
    const offline = given({
      isError: true,
      error: { code: 'NETWORK_ERROR', message: 'Network request failed' },
    });
    expect(findByTestID(offline, 'hoy-offline')).toBeDefined();
    offline.unmount();

    const serverError = given({
      isError: true,
      error: { code: 'INTERNAL_ERROR', message: 'Algo ha fallado' },
    });
    expect(findByTestID(serverError, 'hoy-offline')).toBeUndefined();
    expect(textOf(serverError)).toContain('Algo ha fallado');
    serverError.unmount();
  });

  it('still renders navigation when a module fails — the screen is not all-or-nothing', () => {
    const renderer = given({
      isError: true,
      error: { code: 'INTERNAL_ERROR', message: 'Algo ha fallado' },
    });

    expect(findByTestID(renderer, 'quick-task')).toBeDefined();
    expect(findByTestID(renderer, 'more-pets')).toBeDefined();

    renderer.unmount();
  });

  it('keeps a door to Casa even when no household is active', () => {
    const renderer = given({ householdId: null });

    // "En casa" is the only entry point to the Casa hub, which is in turn the
    // only entry point to Inventario — hiding it on the Personal scope would
    // orphan that whole section.
    const row = findByTestID(renderer, 'hoy-household-row');
    expect(row).toBeDefined();
    expect(textOfNode(row)).toContain('Personal');

    act(() => {
      row?.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('HouseholdHub');

    renderer.unmount();
  });

  it('points at the household setup when the user has no household at all', () => {
    const renderer = given({ householdId: null, households: [] });

    expect(textOfNode(findByTestID(renderer, 'hoy-household-row'))).toContain('Sin hogar');

    renderer.unmount();
  });

  it('shows the household summary with its real name and member count', () => {
    const renderer = given({
      households: [{ id: 'hh-1', name: 'Casa Gregory', memberCount: 3 }],
    });

    const text = textOf(renderer);
    expect(text).toContain('Casa Gregory');
    expect(text).toContain('3 personas');

    renderer.unmount();
  });

  it('renders the Meow line only when the backend actually sent one', () => {
    const withoutMeow = given({ summary: { meowSummary: '' } });
    expect(findByTestID(withoutMeow, 'hoy-meow')).toBeUndefined();
    withoutMeow.unmount();

    const withMeow = given({ summary: { meowSummary: 'Tienes 2 tareas para hoy.' } });
    expect(textOfNode(findByTestID(withMeow, 'hoy-meow'))).toContain('Tienes 2 tareas para hoy.');
    withMeow.unmount();
  });

  it('routes each quick action to its real destination', () => {
    const renderer = given();

    act(() => {
      findByTestID(renderer, 'quick-task')?.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('TaskForm');

    act(() => {
      findByTestID(renderer, 'quick-sos')?.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('SOSActivation');

    renderer.unmount();
  });

  it('opens a task from the day list', () => {
    const renderer = given({ summary: { tasksToday: [task('t1', 'Comprar pienso')] } });

    const row = renderer.root.findAll(
      (node) => node.props.accessibilityLabel === 'Comprar pienso',
    )[0];
    act(() => {
      row?.props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('TaskDetail', { taskId: 't1' });

    renderer.unmount();
  });

  it('keeps every non-tab section reachable from Hoy', () => {
    const renderer = given();

    // The five tabs are reachable from the tab bar; everything else has Hoy as
    // its only entry point, so this list is load-bearing.
    for (const key of ['pets', 'moments', 'savings', 'sos', 'contacts', 'meow', 'account']) {
      expect(findByTestID(renderer, `more-${key}`)).toBeDefined();
    }

    renderer.unmount();
  });
});
