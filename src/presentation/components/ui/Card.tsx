import type { CardTone, ColorTokens } from '@core/theme';
import {
  cardToneBackground,
  radius,
  shadows,
  spacing,
  useTheme,
  useThemedStyles,
} from '@core/theme';
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

/** `basic`/`pastel`/`interactive` from cards.md. "con imagen", "con acciones"
 * and "con avatar" are content compositions of these, not separate looks, so
 * they are expressed as slots rather than variants. */
export type CardVariant = 'basic' | 'pastel' | 'interactive';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * The tone union and its token mapping live in the colour layer, so a supported
 * tone can never point at a token that only exists in one palette (TD-044).
 */
export type { CardTone };

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  /** Only meaningful with `variant="pastel"`. */
  tone?: CardTone;
  /** Optional media slot ("card con imagen"). */
  image?: ReactNode;
  /** Optional footer slot ("card con acciones"). */
  actions?: ReactNode;
  /** Optional leading slot ("card con avatar"). */
  avatar?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Heights from cards.md; `xl` is variable, so it only gets a minimum. */
const MIN_HEIGHTS: Record<CardSize, number | undefined> = {
  sm: 80,
  md: 120,
  lg: 180,
  xl: undefined,
};

/** radius.md: small cards use lg, large cards use xl. */
const RADIUS_BY_SIZE: Record<CardSize, number> = {
  sm: radius.lg,
  md: radius.lg,
  lg: radius.xl,
  xl: radius.xl,
};

const makeStyles = (theme: ColorTokens) => ({
  base: {
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  body: { padding: spacing.s4, gap: spacing.s3, flex: 1 },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.s3 },
});

export const Card = ({
  children,
  variant = 'basic',
  size = 'xl',
  tone = 'primary',
  image,
  actions,
  avatar,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: CardProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const content = (
    <View style={styles.body}>
      {avatar || image ? <View style={styles.header}>{avatar}</View> : null}
      {image}
      {children}
      {actions ? <View style={styles.header}>{actions}</View> : null}
    </View>
  );

  const pastelStyle =
    variant === 'pastel' ? { backgroundColor: theme[cardToneBackground[tone]] } : null;
  const baseStyle: StyleProp<ViewStyle> = [
    styles.base,
    pastelStyle,
    { borderRadius: RADIUS_BY_SIZE[size], minHeight: MIN_HEIGHTS[size] },
    variant === 'interactive' ? shadows.lg : shadows.md,
    style,
  ];

  if (variant === 'interactive' && onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [baseStyle, pressed ? { opacity: 0.9 } : null]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} accessibilityLabel={accessibilityLabel} style={baseStyle}>
      {content}
    </View>
  );
};
