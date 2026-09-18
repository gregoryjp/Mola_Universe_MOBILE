import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { ValuePropsScreen } from '@presentation/auth/screens/ValuePropsScreen';

const navigation = { navigate: vi.fn(), goBack: vi.fn() };

/** Matches `useWindowDimensions` in the shared stub; slides are `width` wide. */
const VIEWPORT_WIDTH = 390;
const SLIDE_COUNT = 4;

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

const host = (renderer: ReactTestRenderer, testID: string): ReactTestInstance => {
  const matches = renderer.root.findAll(
    (node) => typeof node.type === 'string' && node.props.testID === testID,
  );
  if (matches.length !== 1) {
    throw new Error(`expected exactly one host with testID "${testID}", found ${matches.length}`);
  }
  return matches[0] as ReactTestInstance;
};

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<ValuePropsScreen navigation={navigation as never} route={{} as never} />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const press = (renderer: ReactTestRenderer, testID: string): void => {
  act(() => {
    host(renderer, testID).props.onPress();
  });
};

/** Fires the paging callback the way a real swipe would, landing on `page`. */
const swipeToPage = (renderer: ReactTestRenderer, page: number): void => {
  act(() => {
    host(renderer, 'value-props-scroll').props.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { x: page * VIEWPORT_WIDTH } },
    });
  });
};

/** Index of the dot the carousel currently marks as active, or -1. */
const activeDotIndex = (renderer: ReactTestRenderer): number => {
  const dots = host(renderer, 'value-props-dots').children.filter(
    (child): child is ReactTestInstance => typeof child !== 'string',
  );
  expect(dots).toHaveLength(SLIDE_COUNT);
  const marked = dots.map((dot) =>
    // `style={[styles.dot, active ? styles.dotActive : null]}` — the base style is
    // always truthy, so only the second slot tells active from inactive.
    Array.isArray(dot.props.style) ? Boolean(dot.props.style[1]) : false,
  );
  expect(marked.filter(Boolean)).toHaveLength(1);
  return marked.indexOf(true);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ValuePropsScreen — the carousel between Welcome and Choose Method', () => {
  it('presents the four value props in order, matching modules that really exist', () => {
    const text = textOf(render());

    const expected = [
      'Organiza tu hogar',
      'Cuida a los tuyos',
      'Guarda los momentos',
      'Ahorra en equipo',
    ];
    const positions = expected.map((title) => text.indexOf(title));

    for (const [index, position] of positions.entries()) {
      expect(position, `${expected[index]} missing from the copy`).toBeGreaterThanOrEqual(0);
    }
    // The carousel must show them in this order, not merely contain all four.
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('starts on the first slide with the first dot marked', () => {
    expect(activeDotIndex(render())).toBe(0);
  });

  it('follows the swipe: the active dot tracks the page reached', () => {
    const renderer = render();

    swipeToPage(renderer, 2);
    expect(activeDotIndex(renderer)).toBe(2);

    swipeToPage(renderer, SLIDE_COUNT - 1);
    expect(activeDotIndex(renderer)).toBe(SLIDE_COUNT - 1);
  });

  it('clamps out-of-range offsets so a bounce can never mark a non-existent dot', () => {
    const renderer = render();

    swipeToPage(renderer, -1);
    expect(activeDotIndex(renderer)).toBe(0);

    swipeToPage(renderer, SLIDE_COUNT + 3);
    expect(activeDotIndex(renderer)).toBe(SLIDE_COUNT - 1);
  });

  it('moves the user forward from every slide, relabelling the CTA on the last one', () => {
    const renderer = render();

    expect(host(renderer, 'value-props-primary').props.accessibilityLabel).toBe('Siguiente');

    swipeToPage(renderer, SLIDE_COUNT - 1);
    expect(host(renderer, 'value-props-primary').props.accessibilityLabel).toBe('Comenzar');
  });

  it('sends both the primary action and the skip link to Choose Method', () => {
    const renderer = render();

    press(renderer, 'value-props-primary');
    expect(navigation.navigate).toHaveBeenCalledWith('ChooseMethod');

    navigation.navigate.mockClear();
    press(renderer, 'value-props-skip');
    expect(navigation.navigate).toHaveBeenCalledWith('ChooseMethod');
  });

  it('never skips straight past account creation', () => {
    const renderer = render();

    press(renderer, 'value-props-primary');
    press(renderer, 'value-props-skip');

    expect(navigation.navigate).not.toHaveBeenCalledWith('Register');
    expect(navigation.navigate).not.toHaveBeenCalledWith('Login');
  });
});
