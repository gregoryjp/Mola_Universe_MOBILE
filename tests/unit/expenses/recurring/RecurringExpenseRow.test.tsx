import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../../helpers/reactNativeStub')).reactNativeStub,
);

import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import { RecurringExpenseRow } from '@presentation/expenses/recurring/components/RecurringExpenseRow';

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

/** Flattens every string child of the tree, so split text nodes still match. */
const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const render = (node: React.ReactElement): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(node);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const noop = (): void => undefined;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecurringExpenseRow turn label (TD-024)', () => {
  it('names the member whose turn it is, instead of "otro miembro"', () => {
    const renderer = render(
      <RecurringExpenseRow
        expense={expense('u2')}
        myUserId="u1"
        turnMemberName="Ana"
        onRestock={noop}
        onArchive={noop}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain('Le toca a Ana');
    expect(collectText(renderer.toJSON())).not.toContain('Le toca a otro miembro');

    renderer.unmount();
  });

  it('keeps "Te toca reponer" when the turn is mine, even with names available', () => {
    const renderer = render(
      <RecurringExpenseRow
        expense={expense('u1')}
        myUserId="u1"
        turnMemberName="Gregory"
        onRestock={noop}
        onArchive={noop}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain('Te toca reponer');

    renderer.unmount();
  });

  it('falls back to neutral copy when the name is unknown', () => {
    const renderer = render(
      <RecurringExpenseRow
        expense={expense('u-archived')}
        myUserId="u1"
        turnMemberName={null}
        onRestock={noop}
        onArchive={noop}
      />,
    );

    const text = collectText(renderer.toJSON());
    expect(text).toContain('Le toca a otro miembro');
    expect(text).not.toContain('u-archived');

    renderer.unmount();
  });

  it('says there is no turn when the backend assigned none', () => {
    const renderer = render(
      <RecurringExpenseRow
        expense={expense(null)}
        myUserId="u1"
        turnMemberName={null}
        onRestock={noop}
        onArchive={noop}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain('Sin turno asignado');

    renderer.unmount();
  });

  it('still wires restock and archive to their handlers', () => {
    const onRestock = vi.fn();
    const onArchive = vi.fn();
    const renderer = render(
      <RecurringExpenseRow
        expense={expense('u2')}
        myUserId="u1"
        turnMemberName="Ana"
        onRestock={onRestock}
        onArchive={onArchive}
      />,
    );

    act(() => {
      renderer.root.findByProps({ accessibilityLabel: 'Reponer Papel higiénico' }).props.onPress();
    });
    act(() => {
      renderer.root.findByProps({ accessibilityLabel: 'Archivar Papel higiénico' }).props.onPress();
    });

    expect(onRestock).toHaveBeenCalledTimes(1);
    expect(onArchive).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });
});
