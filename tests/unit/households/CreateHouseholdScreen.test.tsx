import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock('@presentation/households/hooks/useCreateHousehold', () => ({
  useCreateHousehold: () => ({
    mutate: mocks.mutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import { CreateHouseholdScreen } from '@presentation/households/screens/CreateHouseholdScreen';

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

const given = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <CreateHouseholdScreen navigation={navigation as never} route={{} as never} />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const findByTestID = (renderer: ReactTestRenderer, testID: string) =>
  renderer.root.findAll((node) => node.props.testID === testID)[0];

const findByLabel = (renderer: ReactTestRenderer, label: string) =>
  renderer.root.findAll((node) => node.props.accessibilityLabel === label)[0];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateHouseholdScreen — Gestión del hogar', () => {
  it('offers a way back, so deciding not to create a household is possible', () => {
    const renderer = given();

    const back = findByLabel(renderer, 'Volver');
    expect(back).toBeDefined();

    act(() => {
      back?.props.onPress();
    });
    expect(navigation.goBack).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });

  it('returns to Hoy once the household exists', () => {
    const renderer = given();

    act(() => {
      findByTestID(renderer, 'household-name')?.props.onChangeText('Casa Gregory');
    });
    act(() => {
      findByTestID(renderer, 'household-submit')?.props.onPress();
    });

    expect(mocks.mutate).toHaveBeenCalledWith(
      { name: 'Casa Gregory' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    renderer.unmount();
  });
});
