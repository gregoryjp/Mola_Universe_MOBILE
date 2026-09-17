import type { TrustedContact } from '@domain/sos/entities/Sos';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useTrustedContacts: vi.fn(),
  useCreateTrustedContact: vi.fn(),
  useDeleteTrustedContact: vi.fn(),
  useResendContactInvite: vi.fn(),
}));

vi.mock('@presentation/sos/hooks/useSos', () => ({
  useTrustedContacts: mocks.useTrustedContacts,
}));

vi.mock('@presentation/sos/hooks/useSosMutations', () => ({
  useCreateTrustedContact: mocks.useCreateTrustedContact,
  useDeleteTrustedContact: mocks.useDeleteTrustedContact,
  useResendContactInvite: mocks.useResendContactInvite,
}));

import { TrustedContactsScreen } from '@presentation/sos/screens/TrustedContactsScreen';

const contact = (verified: boolean, id = 'c1'): TrustedContact => ({
  id,
  name: `Contacto ${id}`,
  email: `${id}@example.com`,
  phone: null,
  isMolaUser: false,
  pushEnabled: false,
  verified,
  createdAt: '2026-09-17T09:00:00.000Z',
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

const idle = { isPending: false, isError: false, isSuccess: false, mutate: vi.fn() };

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<TrustedContactsScreen navigation={{} as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const findPressable = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useTrustedContacts.mockReturnValue({ data: [], isLoading: false, isError: false });
  mocks.useCreateTrustedContact.mockReturnValue(idle);
  mocks.useDeleteTrustedContact.mockReturnValue(idle);
  mocks.useResendContactInvite.mockReturnValue(idle);
});

describe('TrustedContactsScreen — resend wiring (TD-034)', () => {
  it('offers the resend action only on the pending contacts', () => {
    mocks.useTrustedContacts.mockReturnValue({
      data: [contact(false, 'c1'), contact(true, 'c2')],
      isLoading: false,
      isError: false,
    });

    const renderer = render();

    expect(findPressable(renderer, 'contact-c1-resend')).toBeDefined();
    expect(findPressable(renderer, 'contact-c2-resend')).toBeUndefined();
  });

  it('resends for the contact that was pressed, not another one', () => {
    const mutate = vi.fn();
    mocks.useResendContactInvite.mockReturnValue({ ...idle, mutate });
    mocks.useTrustedContacts.mockReturnValue({
      data: [contact(false, 'c1'), contact(false, 'c2')],
      isLoading: false,
      isError: false,
    });

    const renderer = render();
    const button = findPressable(renderer, 'contact-c2-resend');
    if (!button) throw new Error('resend action not rendered');

    act(() => {
      (button.props.onPress as () => void)();
    });

    expect(mutate).toHaveBeenCalledWith('c2');
  });

  it('tells the user the invite went out once the request succeeds', () => {
    mocks.useResendContactInvite.mockReturnValue({ ...idle, isSuccess: true });
    mocks.useTrustedContacts.mockReturnValue({
      data: [contact(false, 'c1')],
      isLoading: false,
      isError: false,
    });

    expect(textOf(render())).toContain('Invitación reenviada');
  });

  it('shows the backend refusal instead of a false success', () => {
    mocks.useResendContactInvite.mockReturnValue({
      ...idle,
      isError: true,
      error: { code: 'CONTACT_ALREADY_VERIFIED', message: 'Trusted contact is already verified' },
    });
    mocks.useTrustedContacts.mockReturnValue({
      data: [contact(false, 'c1')],
      isLoading: false,
      isError: false,
    });

    const text = textOf(render());

    expect(text).toContain('Trusted contact is already verified');
    expect(text).not.toContain('Invitación reenviada');
  });
});
