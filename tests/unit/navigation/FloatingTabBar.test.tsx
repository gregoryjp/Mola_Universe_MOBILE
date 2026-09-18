import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { FloatingTabBar } from '@core/navigation/FloatingTabBar';

const ROUTE_NAMES = ['Dashboard', 'TasksList', 'ShoppingLists', 'Expenses', 'Calendar'];

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  emit: vi.fn(() => ({ defaultPrevented: false })),
  parentNavigate: vi.fn(),
}));

const buildProps = (index = 0): BottomTabBarProps =>
  ({
    state: {
      index,
      key: 'tabs',
      routeNames: ROUTE_NAMES,
      routes: ROUTE_NAMES.map((name) => ({ key: `${name}-key`, name })),
      stale: false,
      type: 'tab',
      history: [],
    },
    descriptors: {},
    navigation: {
      navigate: mocks.navigate,
      emit: mocks.emit,
      getParent: () => ({ navigate: mocks.parentNavigate }),
    },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  }) as unknown as BottomTabBarProps;

const render = (index = 0): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<FloatingTabBar {...buildProps(index)} />);
  });
  if (!renderer) throw new Error('renderer was not created');
  return renderer;
};

const findAllLabels = (renderer: ReactTestRenderer): string[] =>
  renderer.root
    .findAll((node) => typeof node.props.accessibilityLabel === 'string')
    .map((node) => node.props.accessibilityLabel as string);

const findByTestID = (renderer: ReactTestRenderer, testID: string) => {
  const found = renderer.root.findAll((node) => node.props.testID === testID)[0];
  if (!found) throw new Error(`no node with testID "${testID}"`);
  return found;
};

const barChildTestIDs = (renderer: ReactTestRenderer): (string | undefined)[] => {
  const json = renderer.toJSON();
  const children = (json as unknown as { children: Array<{ props: { testID?: string } }> })
    .children;
  return children.map((child) => child.props.testID);
};

describe('FloatingTabBar', () => {
  beforeEach(() => {
    mocks.navigate.mockClear();
    mocks.emit.mockClear();
    mocks.parentNavigate.mockClear();
  });

  it('renders one button per route plus a single create affordance', () => {
    const renderer = render();
    const labels = findAllLabels(renderer);

    for (const label of ['Hoy', 'Tareas', 'Compras', 'Gastos', 'Agenda']) {
      expect(labels).toContain(label);
    }
    expect(labels.filter((label) => label === 'Añadir')).toHaveLength(1);
  });

  it('places the create affordance between the third and fourth tab', () => {
    const renderer = render();
    const testIDs = barChildTestIDs(renderer);

    expect(testIDs).toHaveLength(6);
    expect(testIDs[3]).toBe('tab-create');
    expect(testIDs.filter(Boolean)).toEqual(['tab-create']);
  });

  it('pushes UniversalCreate on the parent stack instead of switching tab', () => {
    const renderer = render();
    const create = findByTestID(renderer, 'tab-create');

    act(() => {
      create.props.onPress();
    });

    expect(mocks.parentNavigate).toHaveBeenCalledWith('UniversalCreate');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('does not emit a tabPress event for the create affordance', () => {
    const renderer = render();
    const create = findByTestID(renderer, 'tab-create');

    act(() => {
      create.props.onPress();
    });

    expect(mocks.emit).not.toHaveBeenCalled();
  });

  it('keeps switching tabs working on the real tabs', () => {
    const renderer = render();
    const tasks = renderer.root.findAll(
      (node) => node.props.accessibilityLabel === 'Tareas',
    )[0];
    if (!tasks) throw new Error('no tab labelled "Tareas"');

    act(() => {
      tasks.props.onPress();
    });

    expect(mocks.navigate).toHaveBeenCalledWith('TasksList');
    expect(mocks.parentNavigate).not.toHaveBeenCalled();
  });
});
