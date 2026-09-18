import type { ColorTokens } from '@core/theme';
import { spacing, useThemedStyles } from '@core/theme';
import type { JSX, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/** Subset of safe-area-context's `Edge`, re-declared to keep this API local. */
export type ScreenEdge = 'top' | 'right' | 'bottom' | 'left';

export interface ScreenProps {
  children: ReactNode;
  /**
   * Where the content sits when it does not fill the viewport. Content that
   * overflows scrolls either way, so this is alignment, never positioning.
   * `spread` pins the first child to the top and the last to the bottom, which
   * is how the login screen separates its header from its secondary links.
   */
  align?: 'top' | 'center' | 'spread';
  /**
   * Makes room for the on-screen keyboard. Set this only on screens with text
   * inputs — see the platform note in the component body.
   */
  keyboardAware?: boolean;
  /** Tapping the background dismisses the keyboard. */
  dismissKeyboardOnTap?: boolean;
  /** Safe-area edges applied by the container. The bottom one is always handled. */
  edges?: ScreenEdge[];
  /** Caps the content column so lines stay readable on tablets and web. */
  maxWidth?: number;
  /** Vertical gap between the column's direct children. Pass a `spacing` token. */
  gap?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DEFAULT_MAX_WIDTH = 440;

/**
 * The page shell for MOLA screens: safe area, one scrollable flexible column,
 * and — when asked — keyboard avoidance.
 *
 * It exists because every Auth screen with inputs was a plain `View` with
 * `justifyContent: 'center'` and no way to scroll, so on a small phone the CTA
 * could sit under the keyboard with no way to reach it (TD-043). Six copies of
 * the same `KeyboardAvoidingView` + `ScrollView` would have been the other
 * option; this is the single one.
 *
 * Deliberately not done: no fixed heights, no `marginTop` tuned to one device,
 * no `automaticallyAdjustKeyboardInsets` on the `ScrollView` (it would stack
 * with `KeyboardAvoidingView` and compensate twice). The `ScrollView` is inside
 * the `TouchableWithoutFeedback`, never around it, so tap-to-dismiss cannot
 * swallow taps or break dragging.
 */
export const Screen = ({
  children,
  align = 'top',
  keyboardAware = false,
  dismissKeyboardOnTap = false,
  edges = ['top'],
  maxWidth = DEFAULT_MAX_WIDTH,
  gap,
  contentContainerStyle,
  style,
  testID,
}: ScreenProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const justify =
    align === 'center' ? 'center' : align === 'spread' ? 'space-between' : 'flex-start';

  // Always a single child element, so `TouchableWithoutFeedback` can wrap it.
  const body = <View style={[styles.body, { justifyContent: justify, gap }]}>{children}</View>;

  const content = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        // The bottom inset goes in as content padding instead of a safe-area
        // edge: with the keyboard up the inset means nothing, and stacking it on
        // top of KeyboardAvoidingView's padding leaves a dead strip under the CTA.
        { paddingBottom: insets.bottom + spacing.s6 },
        contentContainerStyle,
      ]}
      // Without this, a tap on a button while the keyboard is open only dismisses
      // the keyboard, and the user has to tap twice to submit.
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      <View style={[styles.column, { maxWidth, justifyContent: justify }]}>
        {dismissKeyboardOnTap ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {body}
          </TouchableWithoutFeedback>
        ) : (
          body
        )}
      </View>
    </ScrollView>
  );

  // iOS draws the keyboard over the window, so the container has to give up the
  // space itself.
  //
  // Android does not: `app.json` leaves `softwareKeyboardLayoutMode` unset, which
  // selects the default `resize` window mode. The activity is already shrunk, so
  // the ScrollView simply has less room — a KeyboardAvoidingView on top of that
  // would compensate twice and push the CTA off screen.
  //
  // Web has no on-screen keyboard to make room for.
  const needsKeyboardAvoidance = keyboardAware && Platform.OS === 'ios';

  return (
    <SafeAreaView style={[styles.root, style]} edges={edges}>
      {needsKeyboardAvoidance ? (
        <KeyboardAvoidingView style={styles.root} behavior="padding">
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center' as const,
  },
  column: {
    width: '100%' as const,
    flexGrow: 1,
    paddingHorizontal: spacing.s6,
  },
  body: {
    width: '100%' as const,
    flexGrow: 1,
  },
});
