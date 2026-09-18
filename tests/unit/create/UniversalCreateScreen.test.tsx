import type { RootStackParamList } from '@core/navigation/types';
import { UniversalCreateScreen } from '@presentation/create/screens/UniversalCreateScreen';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { act, create } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

const collectText = (node: unknown): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node !== null && typeof node === 'object' && 'children' in node) {
    return collectText((node as { children: unknown }).children);
  }
  return '';
};

const render = (): { renderer: ReactTestRenderer; navigation: { navigate: ReturnType<typeof vi.fn>; goBack: ReturnType<typeof vi.fn> } } => {
  const navigation = { navigate: vi.fn(), goBack: vi.fn() };
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <UniversalCreateScreen
        {...({ navigation } as unknown as NativeStackScreenProps<
          RootStackParamList,
          'UniversalCreate'
        >)}
      />,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return { renderer, navigation };
};

const row = (renderer: ReactTestRenderer, key: string): ReactTestInstance => {
  const found = renderer.root.findAll(
    (n) => n.props.testID === `create-${key}` && typeof n.props.onPress === 'function',
  )[0];
  if (!found) throw new Error(`no create row for "${key}"`);
  return found;
};

const press = (renderer: ReactTestRenderer, key: string): void => {
  act(() => {
    row(renderer, key).props.onPress();
  });
};

describe('UniversalCreateScreen', () => {
  it('asks the one question and offers the everyday five', () => {
    const { renderer } = render();
    const text = collectText(renderer.toJSON());

    expect(text).toContain('¿Qué quieres añadir?');
    for (const label of ['Tarea', 'Evento', 'Compra', 'Gasto', 'Momento']) {
      expect(text).toContain(label);
    }

    renderer.unmount();
  });

  it('keeps the secondary action behind a "Más" heading instead of flattening the list', () => {
    const { renderer } = render();
    const text = collectText(renderer.toJSON());

    expect(text).toContain('Más');
    expect(text).toContain('Mascota');

    renderer.unmount();
  });

  it('sends every row to a screen that already exists, inventing no new flow', () => {
    const { renderer, navigation } = render();

    press(renderer, 'task');
    expect(navigation.navigate).toHaveBeenLastCalledWith('QuickTaskCreate');

    press(renderer, 'event');
    expect(navigation.navigate).toHaveBeenLastCalledWith('CalendarEventForm', {});

    press(renderer, 'expense');
    expect(navigation.navigate).toHaveBeenLastCalledWith('ExpenseForm');

    press(renderer, 'moment');
    expect(navigation.navigate).toHaveBeenLastCalledWith('MomentForm', {});

    press(renderer, 'pet');
    expect(navigation.navigate).toHaveBeenLastCalledWith('PetForm', {});

    renderer.unmount();
  });

  it('opens the Compras section for a purchase, because an item needs a list', () => {
    const { renderer, navigation } = render();

    press(renderer, 'shopping');

    expect(navigation.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'ShoppingLists' });

    renderer.unmount();
  });

  it('goes back to wherever the "+" was tapped from', () => {
    const { renderer, navigation } = render();

    const back = renderer.root.findAll(
      (n) => n.props.accessibilityLabel === 'Volver' && typeof n.props.onPress === 'function',
    )[0];
    if (!back) throw new Error('no back affordance');
    act(() => {
      back.props.onPress();
    });

    expect(navigation.goBack).toHaveBeenCalledTimes(1);

    renderer.unmount();
  });
});
