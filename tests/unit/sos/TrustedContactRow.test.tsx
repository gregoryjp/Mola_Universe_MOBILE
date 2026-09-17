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

const render = (verified: boolean): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<TrustedContactRow contact={contact(verified)} onDelete={vi.fn()} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

describe('TrustedContactRow — unverified state is not a dead end (TD-023)', () => {
  it('explains that the contact must accept the emailed invitation', () => {
    expect(textOf(render(false))).toContain('No recibirá tus alertas SOS hasta que acepte');
  });

  it('gives the one action the app can offer: delete and recreate', () => {
    expect(textOf(render(false))).toContain('elimínalo y créalo de nuevo');
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
