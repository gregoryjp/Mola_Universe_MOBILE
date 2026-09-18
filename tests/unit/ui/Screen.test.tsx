import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  'react-native',
  async () => (await import('../../helpers/reactNativeStub')).reactNativeStub,
);

import { spacing } from '@core/theme';
import type { ScreenProps } from '@presentation/components/ui/Screen';
import { Screen } from '@presentation/components/ui/Screen';
import { Text } from 'react-native';
import { reactNativeStub } from '../../helpers/reactNativeStub';
import { safeAreaInsets } from '../../helpers/safeAreaStub';

const SCREEN_TEST_ID = 'screen-under-test';

const originalPlatform = reactNativeStub.Platform.OS;
const originalInsets = { ...safeAreaInsets };

afterEach(() => {
  reactNativeStub.Platform.OS = originalPlatform;
  Object.assign(safeAreaInsets, originalInsets);
  vi.restoreAllMocks();
});

const flatten = (style: unknown): Record<string, unknown> => {
  if (Array.isArray(style)) {
    const merged: Record<string, unknown> = {};
    for (const item of style) {
      if (item) Object.assign(merged, flatten(item));
    }
    return merged;
  }
  return (style ?? {}) as Record<string, unknown>;
};

const render = (props: Partial<ScreenProps> = {}): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <Screen testID={SCREEN_TEST_ID} {...props}>
        <Text>contenido</Text>
      </Screen>,
    );
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

/** `noUncheckedIndexedAccess` is on, so indexing needs an explicit check. */
const first = <T,>(items: T[]): T => {
  const [head] = items;
  if (head === undefined) throw new Error('expected at least one element');
  return head;
};

/**
 * The stub renders host components as plain strings. `String()` keeps this
 * type-safe: for a composite component it stringifies the function instead of
 * comparing a narrowed literal union against a host name.
 */
const byHost = (renderer: ReactTestRenderer, name: string): ReactTestInstance[] =>
  renderer.root.findAll((node) => String(node.type) === name);

const scrollOf = (renderer: ReactTestRenderer): ReactTestInstance => {
  const scroll = byHost(renderer, 'ScrollView');
  expect(scroll).toHaveLength(1);
  return first(scroll);
};

const stylesOf = (renderer: ReactTestRenderer): Record<string, unknown>[] => {
  const walk = (node: unknown): Record<string, unknown>[] => {
    if (node === null || node === undefined) return [];
    if (Array.isArray(node)) return node.flatMap(walk);
    if (typeof node !== 'object') return [];
    const { props, children } = node as { props?: Record<string, unknown>; children?: unknown };
    const own = props && 'style' in props ? [flatten(props.style)] : [];
    const kids = Array.isArray(children) ? children.flatMap(walk) : [];
    return [...own, ...kids];
  };
  return walk(renderer.toJSON());
};

/** Every flex container in the tree that declares the given style key. */
const containersWith = (renderer: ReactTestRenderer, key: string): Record<string, unknown>[] =>
  renderer.root
    .findAll(
      (node) =>
        typeof node.type === 'string' &&
        Array.isArray(node.props.style) &&
        node.props.style.some(
          (entry: unknown) =>
            entry !== null &&
            typeof entry === 'object' &&
            key in (entry as Record<string, unknown>),
        ),
    )
    .map((node) => flatten(node.props.style));

describe('Screen — the page shell', () => {
  it('scrolls: one ScrollView inside the safe area, children within it', () => {
    const renderer = render();

    expect(byHost(renderer, 'SafeAreaView')).toHaveLength(1);
    expect(byHost(renderer, 'ScrollView')).toHaveLength(1);
    expect(renderer.toJSON()).toBeTruthy();
  });

  it('keeps taps reaching buttons while the keyboard is open', () => {
    const renderer = render({ keyboardAware: true });

    expect(scrollOf(renderer).props.keyboardShouldPersistTaps).toBe('handled');
  });

  it('lets the user drag the keyboard away, with the platform-native gesture', () => {
    reactNativeStub.Platform.OS = 'ios';
    expect(scrollOf(render({ keyboardAware: true })).props.keyboardDismissMode).toBe('interactive');

    reactNativeStub.Platform.OS = 'android';
    expect(scrollOf(render({ keyboardAware: true })).props.keyboardDismissMode).toBe('on-drag');
  });

  it('never uses absolute positioning to place content', () => {
    const positioned = stylesOf(render({ keyboardAware: true })).filter(
      (style) => style.position === 'absolute',
    );

    expect(positioned).toEqual([]);
  });

  describe('keyboard avoidance is asked for per screen', () => {
    it('compensates on iOS, where the keyboard floats over the window', () => {
      reactNativeStub.Platform.OS = 'ios';

      const avoiders = byHost(render({ keyboardAware: true }), 'KeyboardAvoidingView');

      expect(avoiders).toHaveLength(1);
      expect(first(avoiders).props.behavior).toBe('padding');
    });

    it('compensates nothing on Android, which already resizes the window', () => {
      reactNativeStub.Platform.OS = 'android';

      // `app.json` leaves `softwareKeyboardLayoutMode` unset (the `resize`
      // default), so a KeyboardAvoidingView here would compensate twice.
      expect(byHost(render({ keyboardAware: true }), 'KeyboardAvoidingView')).toHaveLength(0);
    });

    it('compensates nothing on web, which has no on-screen keyboard', () => {
      reactNativeStub.Platform.OS = 'web';

      expect(byHost(render({ keyboardAware: true }), 'KeyboardAvoidingView')).toHaveLength(0);
    });

    it('stays out of the way on screens without inputs', () => {
      reactNativeStub.Platform.OS = 'ios';

      expect(byHost(render(), 'KeyboardAvoidingView')).toHaveLength(0);
      expect(byHost(render({ keyboardAware: false }), 'KeyboardAvoidingView')).toHaveLength(0);
    });
  });

  describe('tap to dismiss', () => {
    it('dismisses the keyboard when the background is tapped', () => {
      const dismiss = vi.spyOn(reactNativeStub.Keyboard, 'dismiss');

      const renderer = render({ keyboardAware: true, dismissKeyboardOnTap: true });
      const pressable = renderer.root.findAll(
        (node) => typeof node.type === 'string' && typeof node.props.onPress === 'function',
      );

      expect(pressable).toHaveLength(1);
      act(() => {
        first(pressable).props.onPress();
      });

      expect(dismiss).toHaveBeenCalledTimes(1);
    });

    it('does not wrap the content when it is not asked for', () => {
      const renderer = render({ keyboardAware: true });

      expect(
        renderer.root.findAll(
          (node) => typeof node.type === 'string' && typeof node.props.onPress === 'function',
        ),
      ).toHaveLength(0);
    });
  });

  describe('layout is flexible, not fixed', () => {
    it('applies the bottom safe-area inset as content padding', () => {
      safeAreaInsets.bottom = 24;

      const padding = flatten(scrollOf(render()).props.contentContainerStyle).paddingBottom;

      expect(padding).toBe(24 + spacing.s6);
    });

    it('caps the content column instead of stretching across a tablet', () => {
      expect(first(containersWith(render(), 'maxWidth')).maxWidth).toBe(440);
      expect(first(containersWith(render({ maxWidth: 320 }), 'maxWidth')).maxWidth).toBe(320);
    });

    it('maps align to the column alignment', () => {
      const justifyOf = (options: Partial<ScreenProps>): Set<unknown> =>
        new Set(
          containersWith(render(options), 'justifyContent').map((style) => style.justifyContent),
        );

      expect(justifyOf({ align: 'top' })).toEqual(new Set(['flex-start']));
      expect(justifyOf({ align: 'center' })).toEqual(new Set(['center']));
      expect(justifyOf({ align: 'spread' })).toEqual(new Set(['space-between']));
    });
  });
});
