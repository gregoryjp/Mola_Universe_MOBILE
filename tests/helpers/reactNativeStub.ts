/**
 * Minimal `react-native` stub for component tests.
 *
 * The real package ships Flow-annotated sources (`react-native/index.js`), which
 * the Vite pipeline cannot parse, and the suite runs in a plain node
 * environment. Host components are plain strings, which react-test-renderer
 * accepts, so a screen can be rendered and its `onPress` props fired without a
 * device or a native runtime.
 *
 * Note this is deliberately shallow: it lets a test drive the component's
 * behaviour (what gets rendered, what a press calls), not its styling.
 */

const hostComponent = (name: string): string => name;

export const reactNativeStub = {
  View: hostComponent('View'),
  Text: hostComponent('Text'),
  ScrollView: hostComponent('ScrollView'),
  Pressable: hostComponent('Pressable'),
  TouchableOpacity: hostComponent('TouchableOpacity'),
  TextInput: hostComponent('TextInput'),
  Switch: hostComponent('Switch'),
  Image: hostComponent('Image'),
  ActivityIndicator: hostComponent('ActivityIndicator'),
  FlatList: hostComponent('FlatList'),
  SafeAreaView: hostComponent('SafeAreaView'),

  StyleSheet: {
    create: <T>(styles: T): T => styles,
    flatten: <T>(style: T): T => style,
    absoluteFill: {},
    hairlineWidth: 1,
  },

  Platform: {
    OS: 'ios',
    select: <T>(options: Record<string, T>): T | undefined => options.ios ?? options.default,
  },

  useColorScheme: (): string => 'light',
  useWindowDimensions: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),

  AccessibilityInfo: {
    isScreenReaderEnabled: async (): Promise<boolean> => false,
    addEventListener: () => ({ remove: (): void => undefined }),
    announceForAccessibility: (): void => undefined,
  },

  Linking: {
    openSettings: async (): Promise<void> => undefined,
    openURL: async (): Promise<void> => undefined,
  },

  Animated: {
    View: hostComponent('Animated.View'),
    Text: hostComponent('Animated.Text'),
    Image: hostComponent('Animated.Image'),
    Value: class {
      constructor(public value: number) {}
      interpolate(): unknown {
        return this;
      }
      setValue(value: number): void {
        this.value = value;
      }
      addListener(): string {
        return '0';
      }
      removeListener(): void {}
    },
    timing: () => ({ start: (callback?: () => void) => callback?.(), stop: () => undefined }),
    sequence: () => ({ start: (callback?: () => void) => callback?.() }),
    parallel: () => ({ start: (callback?: () => void) => callback?.() }),
    loop: () => ({ start: (callback?: () => void) => callback?.(), stop: () => undefined }),
  },
};
