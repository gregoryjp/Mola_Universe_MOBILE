import type { ColorTokens } from '@core/theme';
import { durations, radius, useThemedStyles } from '@core/theme';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, type StyleProp, type ViewStyle } from 'react-native';

export type SkeletonVariant = 'text' | 'card' | 'list';

interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Overrides the variant height; useful for multi-line text blocks. */
  height?: number;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * states.md asks for a loading placeholder "específico por tipo de contenido
 * (card, lista, texto)" without giving measurements, so the three heights below
 * reuse tokens: `card` takes the md height from cards.md, `text` the body line
 * height. The pulse honours motion.md — reduce-motion users get a static block.
 */
const VARIANTS: Record<SkeletonVariant, { height: number; borderRadius: number }> = {
  text: { height: 16, borderRadius: radius.xs },
  card: { height: 120, borderRadius: radius.lg },
  list: { height: 56, borderRadius: radius.md },
};

const makeStyles = (theme: ColorTokens) => ({
  base: { backgroundColor: theme.surfaceAlt },
});

export const Skeleton = ({
  variant = 'text',
  height,
  width = '100%',
  style,
  testID,
}: SkeletonProps) => {
  const styles = useThemedStyles(makeStyles);
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: durations.medium,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 1, duration: durations.medium, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reduceMotion]);

  const dimensions = VARIANTS[variant];

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      style={[
        styles.base,
        {
          height: height ?? dimensions.height,
          borderRadius: dimensions.borderRadius,
          width,
          opacity,
        },
        style,
      ]}
    />
  );
};
