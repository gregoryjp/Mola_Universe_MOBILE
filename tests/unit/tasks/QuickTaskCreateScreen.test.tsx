import type { RootStackParamList } from '@core/navigation/types';
import type { TaskScope } from '@domain/tasks/entities/Task';
import { QuickTaskCreateScreen } from '@presentation/tasks/screens/QuickTaskCreateScreen';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppError } from '@shared/errors/AppError';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useCreateTask: vi.fn(),
  useCreateHouseholdTask: vi.fn(),
  goBack: vi.fn(),
  navigate: vi.fn(),
  mutatePersonal: vi.fn(),
  mutateHousehold: vi.fn(),
}));

vi.mock('@presentation/tasks/hooks/useTaskMutations', () => ({
  useCreateTask: mocks.useCreateTask,
  useCreateHouseholdTask: mocks.useCreateHouseholdTask,
}));

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

/** The stub renders both the component and its host node; only the host carries
 * the real accessibility state, so every lookup targets `type === 'string'`. */
const host = (renderer: ReactTestRenderer, testID: string): ReactTestInstance => {
  const found = renderer.root.findAll(
    (n) => typeof n.type === 'string' && n.props.testID === testID,
  )[0];
  if (!found) throw new Error(`no host node for testID "${testID}"`);
  return found;
};

/** Built relative to the real clock, so the assertion never depends on the day
 * the suite happens to run on. Mirrors `isoDaysFromNow` in the screen. */
const isoDaysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

interface Options {
  householdId?: string | null;
  scope?: TaskScope;
  personalError?: AppError | null;
  householdError?: AppError | null;
}

const given = (
  options: Options = {},
): { renderer: ReactTestRenderer; navigation: { goBack: () => void; navigate: () => void } } => {
  useHouseholdStore.setState({
    activeHouseholdId: options.householdId === undefined ? null : options.householdId,
    isHydrated: true,
    hasChosen: true,
  });

  mocks.useCreateTask.mockReturnValue({
    mutate: mocks.mutatePersonal,
    isPending: false,
    error: options.personalError ?? null,
  });
  mocks.useCreateHouseholdTask.mockReturnValue({
    mutate: mocks.mutateHousehold,
    isPending: false,
    error: options.householdError ?? null,
  });

  const navigation = { goBack: mocks.goBack, navigate: mocks.navigate };

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <QuickTaskCreateScreen
        {...({
          navigation,
          route: { key: 'QuickTaskCreate', name: 'QuickTaskCreate', params: { scope: options.scope } },
        } as unknown as NativeStackScreenProps<RootStackParamList, 'QuickTaskCreate'>)}
      />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return { renderer, navigation };
};

const typeTitle = (renderer: ReactTestRenderer, value: string): void => {
  const field = renderer.root.findAll(
    (n) =>
      typeof n.type === 'string' &&
      n.props.testID === 'quick-task-title' &&
      typeof n.props.onChangeText === 'function',
  )[0];
  if (!field) throw new Error('no title input');
  act(() => {
    field.props.onChangeText(value);
  });
};

const press = (renderer: ReactTestRenderer, testID: string): void => {
  const target = host(renderer, testID);
  act(() => {
    target.props.onPress();
  });
};

const submit = (renderer: ReactTestRenderer): void => press(renderer, 'quick-task-submit');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('QuickTaskCreateScreen — quick create first', () => {
  it('asks for the task and the two answers the system already defaults', () => {
    const { renderer } = given({ householdId: 'hh-1' });
    const text = textOf(renderer);

    expect(text).toContain('Nueva tarea');
    expect(text).toContain('¿Qué hay que hacer?');
    expect(text).toContain('Cuándo');
    expect(text).toContain('Hoy');
    expect(text).toContain('Mañana');

    renderer.unmount();
  });

  it('keeps the advanced fields out of the way until asked for', () => {
    const { renderer } = given({ householdId: 'hh-1' });
    const text = textOf(renderer);

    // These exist in TaskForm; showing them up front is what made the everyday
    // task feel like an admin form.
    for (const advanced of ['Prioridad', 'Descripción', 'Repetición', 'Responsable']) {
      expect(text).not.toContain(advanced);
    }
    expect(text).toContain('Más opciones');

    renderer.unmount();
  });

  it('will not submit an empty task', () => {
    const { renderer } = given();

    // `disabled` is the prop that actually blocks the press on the real
    // Pressable; `accessibilityState.disabled` is what a screen reader reads.
    const submitState = (): { disabled: boolean; state: { disabled: boolean } } => ({
      disabled: host(renderer, 'quick-task-submit').props.disabled,
      state: host(renderer, 'quick-task-submit').props.accessibilityState,
    });

    expect(submitState().disabled).toBe(true);
    expect(submitState().state.disabled).toBe(true);

    typeTitle(renderer, '   ');
    expect(submitState().disabled).toBe(true);

    typeTitle(renderer, 'Sacar la basura');
    expect(submitState().disabled).toBe(false);
    expect(submitState().state.disabled).toBe(false);

    renderer.unmount();
  });
});

describe('QuickTaskCreateScreen — where the task lands', () => {
  it('creates a personal task when there is no household', () => {
    const { renderer } = given({ householdId: null });

    typeTitle(renderer, 'Sacar la basura');
    submit(renderer);

    expect(mocks.mutatePersonal).toHaveBeenCalledWith(
      { title: 'Sacar la basura', dueDate: isoDaysFromNow(0) },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(mocks.mutateHousehold).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('offers no "Para" choice when there is no household to choose from', () => {
    const { renderer } = given({ householdId: null });

    expect(textOf(renderer)).not.toContain('Para casa');

    renderer.unmount();
  });

  it('defaults to the household when one is active', () => {
    const { renderer } = given({ householdId: 'hh-1' });

    typeTitle(renderer, 'Sacar la basura');
    submit(renderer);

    expect(mocks.mutateHousehold).toHaveBeenCalledWith(
      {
        householdId: 'hh-1',
        // `scope` is never sent: the backend derives it from the route.
        input: { title: 'Sacar la basura', dueDate: isoDaysFromNow(0) },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(mocks.mutatePersonal).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('honours "Para mí" even with a household active', () => {
    const { renderer } = given({ householdId: 'hh-1' });

    typeTitle(renderer, 'Llamar al dentista');
    press(renderer, 'quick-task-scope-personal');
    submit(renderer);

    expect(mocks.mutatePersonal).toHaveBeenCalledTimes(1);
    expect(mocks.mutateHousehold).not.toHaveBeenCalled();

    renderer.unmount();
  });

  it('preselects the scope the entry point passed, so context is not lost', () => {
    const { renderer } = given({ householdId: 'hh-1', scope: 'PERSONAL' });

    typeTitle(renderer, 'Llamar al dentista');
    submit(renderer);

    expect(mocks.mutatePersonal).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('lets an explicit tap beat the scope the entry point passed', () => {
    const { renderer } = given({ householdId: 'hh-1', scope: 'PERSONAL' });

    typeTitle(renderer, 'Sacar la basura');
    press(renderer, 'quick-task-scope-household');
    submit(renderer);

    expect(mocks.mutateHousehold).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });
});

describe('QuickTaskCreateScreen — when', () => {
  it('schedules for today by default', () => {
    const { renderer } = given();

    typeTitle(renderer, 'Sacar la basura');
    submit(renderer);

    expect(mocks.mutatePersonal).toHaveBeenCalledWith(
      { title: 'Sacar la basura', dueDate: isoDaysFromNow(0) },
      expect.anything(),
    );

    renderer.unmount();
  });

  it('schedules for tomorrow when asked', () => {
    const { renderer } = given();

    typeTitle(renderer, 'Sacar la basura');
    press(renderer, 'quick-task-when-tomorrow');
    submit(renderer);

    expect(mocks.mutatePersonal).toHaveBeenCalledWith(
      { title: 'Sacar la basura', dueDate: isoDaysFromNow(1) },
      expect.anything(),
    );

    renderer.unmount();
  });
});

describe('QuickTaskCreateScreen — progressive disclosure', () => {
  it('carries the typed title into the full form instead of asking again', () => {
    const { renderer } = given();

    typeTitle(renderer, '  Renovar el DNI  ');
    press(renderer, 'quick-task-more');

    expect(mocks.navigate).toHaveBeenCalledWith('TaskForm', { title: 'Renovar el DNI' });

    renderer.unmount();
  });

  it('opens the full form with no draft when nothing was typed', () => {
    const { renderer } = given();

    press(renderer, 'quick-task-more');

    expect(mocks.navigate).toHaveBeenCalledWith('TaskForm');

    renderer.unmount();
  });
});

describe('QuickTaskCreateScreen — outcome', () => {
  it('closes the screen once the task is created', () => {
    const { renderer } = given();

    typeTitle(renderer, 'Sacar la basura');
    submit(renderer);

    const options = mocks.mutatePersonal.mock.calls[0]?.[1] as { onSuccess: () => void };
    act(() => {
      options.onSuccess();
    });

    expect(mocks.goBack).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('shows a real failure instead of pretending it saved', () => {
    const { renderer } = given({
      personalError: new AppError('TASK_CREATE_FAILED', 'No se pudo crear la tarea.', 500),
    });

    expect(textOf(renderer)).toContain('No se pudo crear la tarea.');
    expect(host(renderer, 'quick-task-error')).toBeDefined();

    renderer.unmount();
  });

  it('stays quiet when there is no failure', () => {
    const { renderer } = given();

    expect(
      renderer.root.findAll((n) => n.props.testID === 'quick-task-error'),
    ).toHaveLength(0);

    renderer.unmount();
  });

  it('trims the title before sending it', () => {
    const { renderer } = given();

    typeTitle(renderer, '   Sacar la basura   ');
    submit(renderer);

    expect(mocks.mutatePersonal).toHaveBeenCalledWith(
      { title: 'Sacar la basura', dueDate: isoDaysFromNow(0) },
      expect.anything(),
    );

    renderer.unmount();
  });

  it('offers a way back to wherever it was opened from', () => {
    const { renderer } = given();

    press(renderer, 'quick-task-header-back');

    expect(mocks.goBack).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });
});
