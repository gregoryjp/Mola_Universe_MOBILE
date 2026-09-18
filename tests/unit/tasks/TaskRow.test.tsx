import type { Task } from '@domain/tasks/entities/Task';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { TaskRow } from '@presentation/tasks/components/TaskRow';

const isoInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  createdBy: 'u1',
  assignedTo: null,
  title: 'Sacar la basura',
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

interface RenderOptions {
  task?: Partial<Task>;
  onPress?: () => void;
  onToggleComplete?: () => void;
  assigneeName?: string | null;
  isCompleting?: boolean;
  completionFailed?: boolean;
  hideDueLabel?: boolean;
}

const render = (options: RenderOptions = {}): ReactTestRenderer => {
  const { task: overrides, ...rest } = options;
  const props = {
    task: task(overrides),
    onPress: rest.onPress ?? vi.fn(),
    onToggleComplete: rest.onToggleComplete,
    assigneeName: rest.assigneeName,
    isCompleting: rest.isCompleting ?? false,
    completionFailed: rest.completionFailed ?? false,
    hideDueLabel: rest.hideDueLabel ?? false,
    testID: 'row',
  };

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<TaskRow {...props} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const textOf = (renderer: ReactTestRenderer): string => collectText(renderer.toJSON());

const byTestID = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

describe('TaskRow', () => {
  it('shows the title and the real due date', () => {
    const renderer = render();

    const text = textOf(renderer);
    expect(text).toContain('Sacar la basura');
    expect(text).toContain('Hoy');

    renderer.unmount();
  });

  it('never invents a time of day — the model has no such field', () => {
    const renderer = render();

    expect(textOf(renderer)).not.toMatch(/\d{1,2}:\d{2}/);

    renderer.unmount();
  });

  it('marks a household task without relying on colour', () => {
    const renderer = render({ task: { scope: 'HOUSEHOLD' } });

    expect(textOf(renderer)).toContain('Hogar');

    renderer.unmount();
  });

  it('omits the assignee rather than printing a raw user id', () => {
    const withoutName = render({ task: { assignedTo: 'u-42' } });
    expect(textOf(withoutName)).not.toContain('u-42');
    withoutName.unmount();

    const withName = render({ task: { assignedTo: 'u-42' }, assigneeName: 'Gregory' });
    expect(textOf(withName)).toContain('Gregory');
    withName.unmount();
  });

  it('shows the overdue badge while the task is still open', () => {
    const renderer = render({ task: { isOverdue: true, dueDate: isoInDays(-2) } });

    expect(textOf(renderer)).toContain('Atrasada');

    renderer.unmount();
  });

  it('drops the overdue badge once the task is done', () => {
    const renderer = render({
      task: { isOverdue: true, status: 'COMPLETED', completedAt: '2026-09-16T10:00:00Z' },
    });

    expect(textOf(renderer)).not.toContain('Atrasada');

    renderer.unmount();
  });

  it('drops the date label when the surrounding group already states it', () => {
    const renderer = render({ hideDueLabel: true });

    expect(textOf(renderer)).not.toContain('Hoy');

    renderer.unmount();
  });

  it('keeps the overdue badge even when the date label is dropped', () => {
    const renderer = render({
      task: { isOverdue: true, dueDate: isoInDays(-2) },
      hideDueLabel: true,
    });

    expect(textOf(renderer)).toContain('Atrasada');

    renderer.unmount();
  });

  describe('completion control', () => {
    it('is a checkbox with an explicit state, not a bare icon', () => {
      const renderer = render({ onToggleComplete: vi.fn() });

      const control = byTestID(renderer, 'row-complete');
      expect(control?.props.accessibilityRole).toBe('checkbox');
      expect(control?.props.accessibilityState.checked).toBe(false);
      expect(control?.props.accessibilityLabel).toBe('Marcar Sacar la basura como completada');

      renderer.unmount();
    });

    it('reports the checked state once the task is done', () => {
      const renderer = render({
        task: { status: 'COMPLETED', completedAt: '2026-09-16T10:00:00Z' },
        onToggleComplete: vi.fn(),
      });

      expect(byTestID(renderer, 'row-complete')?.props.accessibilityState.checked).toBe(true);

      renderer.unmount();
    });

    it('calls back when tapped', () => {
      const onToggleComplete = vi.fn();
      const renderer = render({ onToggleComplete });

      act(() => {
        byTestID(renderer, 'row-complete')?.props.onPress();
      });

      expect(onToggleComplete).toHaveBeenCalledTimes(1);

      renderer.unmount();
    });

    it('renders read-only when no handler is given', () => {
      const renderer = render();

      expect(byTestID(renderer, 'row-complete')).toBeUndefined();

      renderer.unmount();
    });

    it('disables itself while the request is in flight', () => {
      const renderer = render({ onToggleComplete: vi.fn(), isCompleting: true });

      const control = byTestID(renderer, 'row-complete');
      expect(control?.props.disabled).toBe(true);
      expect(control?.props.accessibilityState.disabled).toBe(true);

      renderer.unmount();
    });

    it('says so in words when completion failed', () => {
      const renderer = render({ onToggleComplete: vi.fn(), completionFailed: true });

      expect(textOf(renderer)).toContain('No se pudo completar');

      renderer.unmount();
    });
  });
});
