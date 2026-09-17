import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import type { Moment } from '@domain/moments/entities/Moment';
import { MomentCard } from '@presentation/moments/components/MomentCard';

const moment: Moment = {
  id: 'm1',
  householdId: 'h1',
  createdBy: 'u1',
  type: 'EVENT',
  title: 'Cena en casa',
  description: 'Traed algo para picar',
  eventDate: '2026-09-20T18:00:00.000Z',
  detail: null,
  status: 'OPEN',
  calendarEventId: null,
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
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

const render = (node: React.ReactElement): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(node);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

describe('MomentCard', () => {
  it('renders the title, the type and the description', () => {
    const renderer = render(<MomentCard moment={moment} onPress={vi.fn()} />);
    const text = collectText(renderer.toJSON());

    expect(text).toContain('Cena en casa');
    expect(text).toContain('Quedada');
    expect(text).toContain('Traed algo para picar');
  });

  it('labels a poll as an interview-style decision', () => {
    const renderer = render(
      <MomentCard moment={{ ...moment, type: 'POLL', eventDate: null }} onPress={vi.fn()} />,
    );

    expect(collectText(renderer.toJSON())).toContain('Encuesta');
  });

  it('flags a cancelled moment', () => {
    const renderer = render(
      <MomentCard moment={{ ...moment, status: 'CANCELLED' }} onPress={vi.fn()} />,
    );

    expect(collectText(renderer.toJSON())).toContain('Cancelado');
  });

  it('calls onPress when tapped', () => {
    const onPress = vi.fn();
    const renderer = render(<MomentCard moment={moment} onPress={onPress} />);

    const pressable = renderer.root.findByProps({ accessibilityLabel: 'Cena en casa' });
    act(() => {
      pressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
