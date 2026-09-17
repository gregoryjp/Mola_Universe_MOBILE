import type { TrustedContact } from '@domain/sos/entities/Sos';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { TrustedContactRow } from '@presentation/sos/components/TrustedContactRow';

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

const contact = (verified: boolean): TrustedContact => ({
  id: 'c1',
  name: 'Ana',
  email: 'ana@example.com',
  phone: null,
  isMolaUser: false,
  pushEnabled: false,
  verified,
  createdAt: '2026-09-17T09:00:00.000Z',
});

const render = (
  verified: boolean,
  options: { isResending?: boolean; onResendInvite?: () => void } = {},
): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <TrustedContactRow
        contact={contact(verified)}
        onDelete={vi.fn()}
        onResendInvite={options.onResendInvite ?? vi.fn()}
        isResending={options.isResending ?? false}
      />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const findPressable = (
  renderer: ReactTestRenderer,
  testID: string,
): { props: Record<string, unknown> } | undefined => {
  const match = renderer.root.findAll((node) => node.props.testID === testID);
  return match[0] as unknown as { props: Record<string, unknown> } | undefined;
};

describe('TrustedContactRow — unverified state is actionable (TD-023, TD-034)', () => {
  it('explains that the contact must accept the emailed invitation', () => {
    expect(textOf(render(false))).toContain('No recibirá tus alertas SOS hasta que acepte');
  });

  it('offers the resend action now that the backend route exists (TD-034)', () => {
    expect(textOf(render(false))).toContain('Reenviar invitación');
    expect(findPressable(render(false), 'contact-c1-resend')).toBeDefined();
  });

  it('hides the resend action for an already-verified contact', () => {
    expect(textOf(render(true))).not.toContain('Reenviar invitación');
    expect(findPressable(render(true), 'contact-c1-resend')).toBeUndefined();
  });

  it('marks the resend action busy while the request is in flight', () => {
    const text = textOf(render(false, { isResending: true }));

    expect(text).toContain('Reenviando…');
    expect(text).not.toContain('Reenviar invitación');
  });

  it('calls the resend handler when the action is pressed', () => {
    const onResendInvite = vi.fn();
    const row = findPressable(render(false, { onResendInvite }), 'contact-c1-resend');
    if (!row) throw new Error('resend action not rendered');

    act(() => {
      (row.props.onPress as () => void)();
    });

    expect(onResendInvite).toHaveBeenCalledTimes(1);
  });

  it('keeps delete-and-recreate as the fallback for a wrong email', () => {
    expect(textOf(render(false))).toContain('si el correo es incorrecto, elimínalo y créalo de nuevo');
  });

  it('does not claim an unverified contact receives the alert by email', () => {
    const text = textOf(render(false));

    expect(text).not.toContain('Recibe la alerta por email');
    expect(text).toContain('Sin verificar: no recibe avisos');
  });

  it('keeps the delivery channel for a verified contact', () => {
    const text = textOf(render(true));

    expect(text).toContain('Recibe la alerta por email');
    expect(text).not.toContain('Sin verificar');
  });
});
