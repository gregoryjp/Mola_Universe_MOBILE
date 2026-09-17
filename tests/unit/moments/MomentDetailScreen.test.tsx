import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useMoment: vi.fn(),
  useMomentExternalInvites: vi.fn(),
  useRespondToMoment: vi.fn(),
  useUpdateMoment: vi.fn(),
  useDeleteMoment: vi.fn(),
  useCreateMomentExternalInvite: vi.fn(),
  currentUser: { id: 'u1' } as { id: string } | null,
}));

vi.mock('@presentation/moments/hooks/useMoments', () => ({
  useMoment: mocks.useMoment,
  useMomentExternalInvites: mocks.useMomentExternalInvites,
}));

vi.mock('@presentation/moments/hooks/useMomentMutations', () => ({
  useRespondToMoment: mocks.useRespondToMoment,
  useUpdateMoment: mocks.useUpdateMoment,
  useDeleteMoment: mocks.useDeleteMoment,
  useCreateMomentExternalInvite: mocks.useCreateMomentExternalInvite,
}));

vi.mock('@shared/store/authStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({ user: mocks.currentUser }),
}));

import type { MomentDetail } from '@domain/moments/entities/Moment';
import { MomentDetailScreen } from '@presentation/moments/screens/MomentDetailScreen';

const detail: MomentDetail = {
  id: 'm1',
  householdId: 'h1',
  createdBy: 'u1',
  type: 'EVENT',
  title: 'Cena en casa',
  description: 'Traed algo para picar',
  eventDate: '2026-09-20T18:00:00.000Z',
  detail: 'En el salón',
  status: 'OPEN',
  calendarEventId: null,
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
  participants: [{ id: 'p1', momentId: 'm1', userId: 'u1', response: 'PENDING', respondedAt: null }],
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

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <MomentDetailScreen
        route={{ params: { momentId: 'm1' } } as never}
        navigation={navigation as never}
      />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const textOf = (renderer: ReactTestRenderer): string => collectText(renderer.toJSON());

const press = (renderer: ReactTestRenderer, testID: string): void => {
  const node = renderer.root.findByProps({ testID });
  act(() => {
    node.props.onPress();
  });
};

const has = (renderer: ReactTestRenderer, testID: string): boolean =>
  renderer.root.findAllByProps({ testID }).length > 0;

const rsvp = { mutate: vi.fn(), isPending: false, isError: false };
const update = { mutate: vi.fn(), isPending: false, isError: false };
const remove = { mutate: vi.fn(), isPending: false, isError: false };
const createInvite = { mutate: vi.fn(), isPending: false, isError: false };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.currentUser = { id: 'u1' };
  mocks.useMoment.mockReturnValue({ data: detail, isLoading: false, isError: false });
  mocks.useMomentExternalInvites.mockReturnValue({ data: [], isLoading: false, isError: false });
  mocks.useRespondToMoment.mockReturnValue(rsvp);
  mocks.useUpdateMoment.mockReturnValue(update);
  mocks.useDeleteMoment.mockReturnValue(remove);
  mocks.useCreateMomentExternalInvite.mockReturnValue(createInvite);
});

describe('MomentDetailScreen', () => {
  it('renders the moment data', () => {
    const text = textOf(render());

    expect(text).toContain('Cena en casa');
    expect(text).toContain('Quedada');
    expect(text).toContain('Traed algo para picar');
    expect(text).toContain('En el salón');
  });

  it('offers both RSVP answers on an open moment', () => {
    const renderer = render();

    expect(has(renderer, 'moment-rsvp-going')).toBe(true);
    expect(has(renderer, 'moment-rsvp-not-going')).toBe(true);
  });

  it('sends the RSVP through the mutation', () => {
    const renderer = render();

    press(renderer, 'moment-rsvp-going');
    expect(rsvp.mutate).toHaveBeenCalledWith('GOING');

    press(renderer, 'moment-rsvp-not-going');
    expect(rsvp.mutate).toHaveBeenCalledWith('NOT_GOING');
  });

  it('hides the RSVP and explains the state when the moment is cancelled', () => {
    mocks.useMoment.mockReturnValue({
      data: { ...detail, status: 'CANCELLED' },
      isLoading: false,
      isError: false,
    });

    const renderer = render();

    expect(has(renderer, 'moment-rsvp-going')).toBe(false);
    expect(textOf(renderer)).toContain('está cancelado');
  });

  it('links to the calendar only when the backend synced an event', () => {
    expect(has(render(), 'moment-calendar-link')).toBe(false);

    mocks.useMoment.mockReturnValue({
      data: { ...detail, calendarEventId: 'c1' },
      isLoading: false,
      isError: false,
    });

    const renderer = render();
    expect(has(renderer, 'moment-calendar-link')).toBe(true);

    press(renderer, 'moment-calendar-link');
    expect(navigation.navigate).toHaveBeenCalledWith('CalendarEventDetail', { eventId: 'c1' });
  });

  it('reserves the play area for gatherings, not for polls', () => {
    expect(textOf(render())).toContain('Zona de juegos');

    mocks.useMoment.mockReturnValue({
      data: { ...detail, type: 'POLL' },
      isLoading: false,
      isError: false,
    });

    expect(textOf(render())).not.toContain('Zona de juegos');
  });

  it('shows the creator actions to the creator', () => {
    const renderer = render();

    expect(has(renderer, 'moment-edit')).toBe(true);
    expect(has(renderer, 'moment-cancel')).toBe(true);
    expect(has(renderer, 'moment-delete')).toBe(true);
  });

  it('hides the creator actions from everyone else', () => {
    mocks.currentUser = { id: 'someone-else' };
    const renderer = render();

    expect(has(renderer, 'moment-edit')).toBe(false);
    expect(has(renderer, 'moment-cancel')).toBe(false);
    expect(has(renderer, 'moment-delete')).toBe(false);
    expect(textOf(renderer)).toContain('Solo quien creó el momento');
  });

  it('hides the creator actions when there is no session user', () => {
    mocks.currentUser = null;
    const renderer = render();

    expect(has(renderer, 'moment-delete')).toBe(false);
  });

  it('cancels the moment through the update mutation', () => {
    const renderer = render();

    press(renderer, 'moment-cancel');

    expect(update.mutate).toHaveBeenCalledWith({ status: 'CANCELLED' });
  });

  it('deletes the moment and goes back', () => {
    const renderer = render();

    press(renderer, 'moment-delete');

    expect(remove.mutate).toHaveBeenCalledWith('m1', expect.objectContaining({ onSuccess: expect.any(Function) }));

    const options = remove.mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    act(() => {
      options.onSuccess();
    });
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('opens the edit form for the creator', () => {
    const renderer = render();

    press(renderer, 'moment-edit');

    expect(navigation.navigate).toHaveBeenCalledWith('MomentForm', { momentId: 'm1' });
  });
});
