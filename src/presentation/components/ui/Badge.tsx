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
 * pairs `bodySmall` with radius-sm and 4/12. Backgrounds use the `*Soft` tokens
 * because colors.md forbids pastel colours as text colour.
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
  success: { backgroundColor: theme.successSoft, borderColor: theme.success, color: theme.success },
  warning: { backgroundColor: theme.warningSoft, borderColor: theme.warning, color: theme.warning },
  error: { backgroundColor: theme.errorSoft, borderColor: theme.error, color: theme.error },
  info: { backgroundColor: theme.infoSoft, borderColor: theme.info, color: theme.info },
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
