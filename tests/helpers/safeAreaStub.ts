/**
 * Stub for `react-native-safe-area-context`.
 *
 * The real package reaches into a `react-native` **subpath**
 * (`react-native/Libraries/Utilities/codegenNativeComponent`, via
 * `lib/module/specs/NativeSafeAreaView.js`). A per-test `vi.mock('react-native')`
 * only intercepts the bare specifier, so the subpath still loads the real
 * Flow-annotated sources and the whole suite dies on `Unexpected token 'typeof'`.
 *
 * Aliasing it once in `vitest.config.ts` is what keeps the `Screen` primitive
 * testable. Components only ever use `SafeAreaView` and `useSafeAreaInsets`.
 *
 * The insets are a mutable object so a test can set a non-zero bottom inset and
 * assert that it lands as content padding; reset it when the test finishes.
 */
export const safeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export const useSafeAreaInsets = (): typeof safeAreaInsets => safeAreaInsets;

export const SafeAreaView = 'SafeAreaView';
