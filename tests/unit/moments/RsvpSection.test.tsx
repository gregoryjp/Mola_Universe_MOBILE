import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import type { MomentParticipant } from '@domain/moments/entities/Moment';
import { RsvpSection } from '@presentation/moments/components/RsvpSection';

const participant = (
  id: string,
  userId: string,
  response: MomentParticipant['response'],
): MomentParticipant => ({ id, momentId: 'm1', userId, response, respondedAt: null });

const render = (node: React.ReactElement): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(node);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

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

const textOf = (renderer: ReactTestRenderer): string => collectText(renderer.toJSON());

const press = (renderer: ReactTestRenderer, testID: string): void => {
  const node = renderer.root.findByProps({ testID });
  act(() => {
    node.props.onPress();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RsvpSection', () => {
  it('summarises the three response states', () => {
    const renderer = render(
      <RsvpSection
        participants={[
          participant('p1', 'u1', 'GOING'),
          participant('p2', 'u2', 'GOING'),
          participant('p3', 'u3', 'NOT_GOING'),
          participant('p4', 'u4', 'PENDING'),
        ]}
        currentUserId="u1"
        onRespond={vi.fn()}
        isPending={false}
        disabled={false}
      />,
    );

    expect(textOf(renderer)).toContain('2 van');
    expect(textOf(renderer)).toContain('1 no pueden');
    expect(textOf(renderer)).toContain('1 pendientes');
  });

  it('says the caller has not answered yet when their response is pending', () => {
    const renderer = render(
      <RsvpSection
        participants={[participant('p1', 'u1', 'PENDING')]}
        currentUserId="u1"
        onRespond={vi.fn()}
        isPending={false}
        disabled={false}
      />,
    );

    expect(textOf(renderer)).toContain('Todavía no has respondido');
  });

  it('shows the caller own answer once they responded', () => {
    const renderer = render(
      <RsvpSection
        participants={[participant('p1', 'u1', 'GOING')]}
        currentUserId="u1"
        onRespond={vi.fn()}
        isPending={false}
        disabled={false}
      />,
    );

    expect(textOf(renderer)).toContain('Tu respuesta: Voy');
  });

  it('sends GOING when the caller presses "Voy"', () => {
    const onRespond = vi.fn();
    const renderer = render(
      <RsvpSection
        participants={[]}
        currentUserId="u1"
        onRespond={onRespond}
        isPending={false}
        disabled={false}
      />,
    );

    press(renderer, 'moment-rsvp-going');

    expect(onRespond).toHaveBeenCalledWith('GOING');
  });

  it('sends NOT_GOING when the caller presses "No puedo"', () => {
    const onRespond = vi.fn();
    const renderer = render(
      <RsvpSection
        participants={[]}
        currentUserId="u1"
        onRespond={onRespond}
        isPending={false}
        disabled={false}
      />,
    );

    press(renderer, 'moment-rsvp-not-going');

    expect(onRespond).toHaveBeenCalledWith('NOT_GOING');
  });

  it('disables both answers when the moment cannot be answered', () => {
    const onRespond = vi.fn();
    const renderer = render(
      <RsvpSection
        participants={[]}
        currentUserId="u1"
        onRespond={onRespond}
        isPending={false}
        disabled
      />,
    );

    expect(renderer.root.findByProps({ testID: 'moment-rsvp-going' }).props.disabled).toBe(true);
    expect(renderer.root.findByProps({ testID: 'moment-rsvp-not-going' }).props.disabled).toBe(
      true,
    );
    expect(onRespond).not.toHaveBeenCalled();
  });
});
