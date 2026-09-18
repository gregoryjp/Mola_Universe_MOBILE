import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { breakpoints, durations, easings, spacing, typography, useThemedStyles } from '@core/theme';
import { BrandLogo } from '@presentation/components/brand/BrandLogo';
import { Mascot } from '@presentation/components/brand/Mascot';
import { Button, Screen } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Text, useWindowDimensions, View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ValueProps'>;

/**
 * The one and only entry screen: the first thing an unauthenticated, hydrated
 * user sees, and the whole of the introduction before account creation.
 *
 * Three flexible zones on a single scrollable column — brand/intro, the Meow
 * moment, actions. No absolute positioning and no fixed heights: the middle zone
 * absorbs the slack on tall phones (more air) and collapses to its content on
 * short ones, where the `Screen` primitive's scroll takes over.
 *
 * This replaced a separate `WelcomeScreen` plus a four-slide carousel. There is
 * deliberately no carousel, no pager, no "Siguiente" and no "Omitir": a product
 * should demonstrate its value through itself, not through four marketing
 * slides the user has to swipe past to reach a button.
 *
 * The two actions avoid `variant="primary"`/`"link"`: their brand-green-on-white
 * pairings measure 2.06:1, below AA (TD-040). `primaryTonal` (8.43:1) and
 * `linkNeutral` (16.23:1) are the additive Design System variants that keep the
 * MOLA token while clearing the contrast minimum.
 */
export const ValuePropsScreen = ({ navigation }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);
  const { height, width } = useWindowDimensions();

  // Start at the final values: if the reduce-motion probe never resolves (or
  // fails), the screen is still fully visible instead of stuck at opacity 0.
  const introOpacity = useRef(new Animated.Value(1)).current;
  const introOffset = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(1)).current;
  const actionsOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active || reduceMotion) return;

      introOpacity.setValue(0);
      introOffset.setValue(ENTRANCE_OFFSET);
      actionsOpacity.setValue(0);
      actionsOffset.setValue(ENTRANCE_OFFSET);

      const entrance = (opacity: Animated.Value, offset: Animated.Value) =>
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: durations.short,
            easing: Easing.bezier(...easings.out),
            useNativeDriver: true,
          }),
          Animated.timing(offset, {
            toValue: 0,
            duration: durations.short,
            easing: Easing.bezier(...easings.out),
            useNativeDriver: true,
          }),
        ]);

      // Brand settles first, actions follow — the eye lands on the promise
      // before the button.
      Animated.sequence([
        entrance(introOpacity, introOffset),
        entrance(actionsOpacity, actionsOffset),
      ]).start();
    });

    return () => {
      active = false;
    };
  }, [actionsOffset, actionsOpacity, introOffset, introOpacity]);

  const compact = height < 700;
  const narrow = width < breakpoints.mobile;
  const mascotWidth = Math.round(
    Math.max(compact ? MASCOT_MIN : MASCOT_MIN + 24, Math.min(MASCOT_MAX, width * MASCOT_RATIO)),
  );

  return (
    <Screen
      align="top"
      contentContainerStyle={{ paddingTop: compact ? spacing.s5 : spacing.s8 }}
      testID="value-props"
    >
      {/* ── 1. BRAND / INTRO ─────────────────────────────────────────── */}
      <Animated.View
        style={[styles.brand, { opacity: introOpacity, transform: [{ translateY: introOffset }] }]}
      >
        <BrandLogo width={LOGO_WIDTH} />
        <Text style={[styles.headline, narrow && styles.headlineNarrow]} accessibilityRole="header">
          Tu universo familiar,{'\n'}en un solo lugar
        </Text>
        <Text style={styles.subtitle}>
          Organiza tareas, cuida a los tuyos y no pierdas de vista lo que importa.
        </Text>
      </Animated.View>

      {/* ── 2. MOMENTO MOLA ─────────────────────────────────────────── */}
      {/* Decorative: `pointerEvents` keeps Meow from swallowing taps, and
          `Mascot` hides herself from screen readers without a label. */}
      <View style={styles.moment} pointerEvents="none">
        <Mascot width={mascotWidth} />
      </View>

      {/* ── 3. ACTION AREA ──────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.actions,
          { opacity: actionsOpacity, transform: [{ translateY: actionsOffset }] },
        ]}
      >
        <Button
          label="Comenzar"
          onPress={() => navigation.navigate('ChooseMethod')}
          variant="primaryTonal"
          size="xl"
          style={styles.cta}
          accessibilityHint="Empieza a crear tu cuenta"
          testID="value-props-start"
        />
        <View style={styles.secondary}>
          <Text style={styles.secondaryText}>¿Ya tienes una cuenta?</Text>
          <Button
            label="Iniciar sesión"
            onPress={() => navigation.navigate('Login')}
            variant="linkNeutral"
            style={styles.inlineLink}
            accessibilityHint="Entra con tu cuenta existente"
            testID="value-props-login"
          />
        </View>
      </Animated.View>
    </Screen>
  );
};

/** Small enough to read as a settle rather than a slide. */
const ENTRANCE_OFFSET = 10;

/** Below the old 160 so the headline, not the wordmark, carries the hierarchy. */
const LOGO_WIDTH = 132;

/** Bounded: a mascot that scales without limit would dominate tall phones. */
const MASCOT_MIN = 96;
const MASCOT_MAX = 160;
const MASCOT_RATIO = 0.3;

const makeStyles = (theme: ColorTokens) => ({
  brand: {
    alignItems: 'center' as const,
    gap: spacing.s5,
  },
  headline: {
    ...typography.h1,
    color: theme.text,
    textAlign: 'center' as const,
    maxWidth: 320,
  },
  /**
   * Measured in the running app: at `h1` (32px) the first line, "Tu universo
   * familiar,", is wider than a 320px phone can give it (272px of content box),
   * so the block falls to three lines. `h2` (24px) restores the two-line balance
   * the composition is built on, and only applies below `mobile` so standard
   * phones keep the larger headline.
   */
  headlineNarrow: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body,
    color: theme.textMuted,
    textAlign: 'center' as const,
    maxWidth: 300,
  },
  moment: {
    flexGrow: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.s6,
  },
  actions: {
    gap: spacing.s3,
  },
  cta: {
    alignSelf: 'stretch' as const,
  },
  secondary: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s1,
  },
  secondaryText: {
    ...typography.body,
    color: theme.textMuted,
  },
  // The link shares the sentence's baseline instead of opening a 16px gap
  // around itself, which would break "…cuenta? Iniciar sesión" into two islands.
  inlineLink: {
    paddingHorizontal: 0,
  },
});
