import type { NotificationPreferences } from '@domain/notifications/entities/Notification';
import { NotificationPreferencesSection } from '@presentation/notifications/components/NotificationPreferencesSection';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const preferences = (overrides: Partial<NotificationPreferences> = {}): NotificationPreferences => ({
  tasksEnabled: true,
  calendarEnabled: true,
  shoppingEnabled: true,
  inventoryEnabled: true,
  expensesEnabled: true,
  accountEnabled: true,
  quietHoursStart: null,
  quietHoursEnd: null,
  ...overrides,
});

const render = (node: React.ReactElement): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(node);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

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

const findByTestId = (renderer: ReactTestRenderer, testID: string): { props: Record<string, unknown> } =>
  renderer.root.findAll((node) => node.props.testID === testID)[0] as {
    props: Record<string, unknown>;
  };

const press = (renderer: ReactTestRenderer, testID: string): void => {
  const node = findByTestId(renderer, testID);
  act(() => {
    (node.props.onPress as () => void)();
  });
};

const type = (renderer: ReactTestRenderer, testID: string, value: string): void => {
  const node = findByTestId(renderer, testID);
  act(() => {
    (node.props.onChangeText as (next: string) => void)(value);
  });
};

const toggle = (renderer: ReactTestRenderer, label: string, value: boolean): void => {
  const node = renderer.root.findAll(
    (candidate) => candidate.props.accessibilityLabel === label,
  )[0];
  act(() => {
    (node?.props.onValueChange as ((next: boolean) => void) | undefined)?.(value);
  });
};

describe('NotificationPreferencesSection — category toggles', () => {
  let onToggle: ReturnType<typeof vi.fn>;
  let onUpdateQuietHours: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggle = vi.fn();
    onUpdateQuietHours = vi.fn();
  });

  const renderSection = (
    prefs: NotificationPreferences,
    disabled = false,
  ): ReactTestRenderer =>
    render(
      <NotificationPreferencesSection
        preferences={prefs}
        disabled={disabled}
        onToggle={onToggle as never}
        onUpdateQuietHours={onUpdateQuietHours as never}
      />,
    );

  it('reports a toggle with its own key', () => {
    const renderer = renderSection(preferences());
    toggle(renderer, 'Avisos de Compra', false);
    expect(onToggle).toHaveBeenCalledWith('shoppingEnabled', false);
  });

  it('does not touch the quiet-hours handler when a category is toggled', () => {
    const renderer = renderSection(preferences());
    toggle(renderer, 'Avisos de Tareas', false);
    expect(onUpdateQuietHours).not.toHaveBeenCalled();
  });
});

describe('NotificationPreferencesSection — quiet hours (TD-025)', () => {
  let onToggle: ReturnType<typeof vi.fn>;
  let onUpdateQuietHours: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggle = vi.fn();
    onUpdateQuietHours = vi.fn();
  });

  const renderSection = (
    prefs: NotificationPreferences,
    disabled = false,
  ): ReactTestRenderer =>
    render(
      <NotificationPreferencesSection
        preferences={prefs}
        disabled={disabled}
        onToggle={onToggle as never}
        onUpdateQuietHours={onUpdateQuietHours as never}
      />,
    );

  it('shows the configured window coming from the server', () => {
    const renderer = renderSection(preferences({ quietHoursStart: '22:00', quietHoursEnd: '07:00' }));
    expect(textOf(renderer)).toContain('Activo de 22:00 a 07:00');
  });

  it('says when quiet hours are off', () => {
    const renderer = renderSection(preferences());
    expect(textOf(renderer)).toContain('Sin horario de silencio');
  });

  it('states that the times are UTC, not local', () => {
    // The backend compares against server UTC; a field that looked local would
    // mean the wrong hours for anyone outside UTC.
    const renderer = renderSection(preferences());
    expect(textOf(renderer)).toContain('UTC');
  });

  it('does not fire on every keystroke', () => {
    const renderer = renderSection(preferences());
    type(renderer, 'quiet-hours-start', '2');
    type(renderer, 'quiet-hours-start', '22');
    type(renderer, 'quiet-hours-start', '22:0');
    expect(onUpdateQuietHours).not.toHaveBeenCalled();
  });

  it('sends both bounds when they are valid', () => {
    const renderer = renderSection(preferences());
    type(renderer, 'quiet-hours-start', '22:00');
    type(renderer, 'quiet-hours-end', '07:00');
    press(renderer, 'quiet-hours-save');

    expect(onUpdateQuietHours).toHaveBeenCalledTimes(1);
    expect(onUpdateQuietHours).toHaveBeenCalledWith({
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    });
  });

  it('refuses a half-set window and explains why', () => {
    // Sending one bound would be accepted by the API and then ignored by the
    // backend, which is the false-positive shape TD-026 fixed elsewhere.
    const renderer = renderSection(preferences());
    type(renderer, 'quiet-hours-start', '22:00');
    press(renderer, 'quiet-hours-save');

    expect(onUpdateQuietHours).not.toHaveBeenCalled();
    expect(textOf(renderer)).toContain('las dos');
  });

  it('refuses a malformed time and names the expected format', () => {
    const renderer = renderSection(preferences());
    type(renderer, 'quiet-hours-start', '22:0');
    type(renderer, 'quiet-hours-end', '07:00');
    press(renderer, 'quiet-hours-save');

    expect(onUpdateQuietHours).not.toHaveBeenCalled();
    expect(textOf(renderer)).toContain('HH:mm');
  });

  it('clears the window when both fields are emptied', () => {
    const renderer = renderSection(preferences({ quietHoursStart: '22:00', quietHoursEnd: '07:00' }));
    type(renderer, 'quiet-hours-start', '');
    type(renderer, 'quiet-hours-end', '');
    press(renderer, 'quiet-hours-save');

    expect(onUpdateQuietHours).toHaveBeenCalledWith({
      quietHoursStart: null,
      quietHoursEnd: null,
    });
  });

  it('offers a clear action only when a window is configured', () => {
    const off = renderSection(preferences());
    expect(findByTestId(off, 'quiet-hours-clear')).toBeUndefined();

    const on = renderSection(preferences({ quietHoursStart: '22:00', quietHoursEnd: '07:00' }));
    expect(findByTestId(on, 'quiet-hours-clear')).toBeDefined();
  });

  it('clears straight from the clear action, without going through save', () => {
    const renderer = renderSection(preferences({ quietHoursStart: '22:00', quietHoursEnd: '07:00' }));
    press(renderer, 'quiet-hours-clear');

    expect(onUpdateQuietHours).toHaveBeenCalledWith({
      quietHoursStart: null,
      quietHoursEnd: null,
    });
  });

  it('marks the save action disabled while a save is in flight', () => {
    // Asserting the declared state, not a direct onPress call: Button passes
    // onPress to Pressable unconditionally and gates it with `disabled`, so
    // invoking the prop directly would bypass the very guard under test.
    const renderer = renderSection(preferences(), true);
    const pressable = renderer.root.findAll(
      (node) => node.props.testID === 'quiet-hours-save' && node.props.accessibilityState,
    )[0];

    expect(pressable?.props.accessibilityState).toEqual({ disabled: true, busy: true });
  });

  it('marks the save action enabled when idle', () => {
    const renderer = renderSection(preferences());
    const pressable = renderer.root.findAll(
      (node) => node.props.testID === 'quiet-hours-save' && node.props.accessibilityState,
    )[0];

    expect(pressable?.props.accessibilityState).toEqual({ disabled: false, busy: false });
  });
});
