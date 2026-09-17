import type { TrustedContact } from '@domain/sos/entities/Sos';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  useTrustedContacts: vi.fn(),
  useSosHistory: vi.fn(),
  useSosLocation: vi.fn(),
  useActivateSos: vi.fn(),
  useCancelSos: vi.fn(),
}));

vi.mock('@presentation/sos/hooks/useSos', () => ({
  useTrustedContacts: mocks.useTrustedContacts,
  useSosHistory: mocks.useSosHistory,
}));

vi.mock('@presentation/sos/hooks/useSosLocation', () => ({
  useSosLocation: mocks.useSosLocation,
}));

vi.mock('@presentation/sos/hooks/useSosMutations', () => ({
  useActivateSos: mocks.useActivateSos,
  useCancelSos: mocks.useCancelSos,
}));

import { SOSActivationScreen } from '@presentation/sos/screens/SOSActivationScreen';

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
const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<SOSActivationScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const given = (contacts: TrustedContact[], activated = false): ReactTestRenderer => {
  mocks.useTrustedContacts.mockReturnValue({ data: contacts, isLoading: false, isError: false });
  mocks.useActivateSos.mockReturnValue({
    ...idle,
    data: activated ? { id: 'e1', cancelWindowMs: 10_000 } : undefined,
  });
  return render();
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useSosHistory.mockReturnValue({ data: [], isLoading: false, isError: false });
  mocks.useSosLocation.mockReturnValue({
    status: 'ready',
    coordinates: null,
    enable: vi.fn(),
  });
  mocks.useCancelSos.mockReturnValue(idle);
  mocks.useActivateSos.mockReturnValue({ ...idle, data: undefined });
  mocks.useTrustedContacts.mockReturnValue({ data: [], isLoading: false, isError: false });
});

describe('SOSActivationScreen — verified contacts only (TD-023)', () => {
  it('warns when every contact is still unverified, instead of promising delivery', () => {
    const text = textOf(given([contact(false, 'c1'), contact(false, 'c2')]));

    expect(text).toContain('Ninguno de tus 2 contactos ha verificado su correo');
    expect(text).toContain('nadie recibirá tu alerta');
  });

  it('never claims it will warn unverified contacts after activating', () => {
    const text = textOf(given([contact(false, 'c1'), contact(false, 'c2')], true));

    expect(text).not.toContain('Se avisará a 2 contacto(s)');
    expect(text).toContain('ningún contacto verificado puede recibirlo');
  });

  it('counts only the verified contacts when activating', () => {
    const text = textOf(given([contact(true, 'c1'), contact(false, 'c2')], true));

    expect(text).toContain('Se avisará a 1 contacto(s) de confianza');
  });

  it('flags the unverified ones even when others are verified', () => {
    const text = textOf(given([contact(true, 'c1'), contact(false, 'c2')]));

    expect(text).toContain('1 contacto aún no ha verificado su correo');
  });

  it('keeps the original warning when there are no contacts at all', () => {
    const text = textOf(given([]));

    expect(text).toContain('No tienes contactos de confianza');
  });
});
