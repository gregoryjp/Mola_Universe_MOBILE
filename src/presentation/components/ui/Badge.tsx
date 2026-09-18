import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * badges.md lists the sizes as sm/md without pixel values, so they are composed
 * from existing tokens: sm pairs `caption` with radius-xs and 4/8 padding, md
 * pairs `bodySmall` with radius-sm and 4/12.
 *
 * Colours follow the rule colors.md states ("forbids pastel colours as text
 * colour"): the `*Soft` token is the FILL and the chromatic accent is the BORDER,
 * but the LABEL is `text`. Using the accent as the label colour — which is what
 * this component used to do — measured 1.42:1 (warning) to 2.08:1 (error) in
 * light mode, i.e. the label was unreadable. `text` clears AA on every `*Soft`
 * fill in both palettes (14.67–15.92:1 light, 8.36–12.65:1 dark).
 */
const SIZES: Record<
  BadgeSize,
  {
    paddingHorizontal: number;
    paddingVertical: number;
    text: 'caption' | 'bodySmall';
    radius: number;
  }
> = {
  sm: {
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s1,
    text: 'caption',
    radius: radius.xs,
  },
  md: {
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s1,
    text: 'bodySmall',
    radius: radius.sm,
  },
};

const makeStyles = (theme: ColorTokens) => ({
  base: { alignSelf: 'flex-start' as const, borderWidth: 1 },
  default: { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.textMuted },
  success: { backgroundColor: theme.successSoft, borderColor: theme.success, color: theme.text },
  warning: { backgroundColor: theme.warningSoft, borderColor: theme.warning, color: theme.text },
  error: { backgroundColor: theme.errorSoft, borderColor: theme.error, color: theme.text },
  info: { backgroundColor: theme.infoSoft, borderColor: theme.info, color: theme.text },
});

export const Badge = ({ label, variant = 'default', size = 'sm', style, testID }: BadgeProps) => {
  const styles = useThemedStyles(makeStyles);
  const dimensions = SIZES[size];
  const tokens = {
    default: {
      bg: styles.default.backgroundColor,
      border: styles.default.borderColor,
      text: styles.default.color,
    },
    success: {
      bg: styles.success.backgroundColor,
      border: styles.success.borderColor,
      text: styles.success.color,
    },
    warning: {
      bg: styles.warning.backgroundColor,
      border: styles.warning.borderColor,
      text: styles.warning.color,
    },
    error: {
      bg: styles.error.backgroundColor,
      border: styles.error.borderColor,
      text: styles.error.color,
    },
    info: {
      bg: styles.info.backgroundColor,
      border: styles.info.borderColor,
      text: styles.info.color,
    },
  }[variant];

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          backgroundColor: tokens.bg,
          borderColor: tokens.border,
          borderRadius: dimensions.radius,
          paddingHorizontal: dimensions.paddingHorizontal,
          paddingVertical: dimensions.paddingVertical,
        },
        style,
      ]}
    >
      <Text style={[typography[dimensions.text], { color: tokens.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};
