import type { ColorTokens } from '@core/theme';
import { spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import { ActivityIndicator, type StyleProp, Text, View, type ViewStyle } from 'react-native';

export type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  /** Optional caption under the indicator. */
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * GAP 3: states.md names a generic Spinner for one-off actions but specifies no
 * size, colour or padding, so this composes one from the icon scale (16/24/32)
 * and centres it with the spacing tokens.
 */
const SIZES: Record<SpinnerSize, { indicator: 'small' | 'large'; height: number }> = {
  sm: { indicator: 'small', height: 16 },
  md: { indicator: 'small', height: 24 },
  lg: { indicator: 'large', height: 32 },
};

const makeStyles = (theme: ColorTokens) => ({
  base: { alignItems: 'center' as const, justifyContent: 'center' as const, gap: spacing.s2 },
  label: { color: theme.textMuted, textAlign: 'center' as const },
});

export const Spinner = ({ size = 'md', label, style, testID }: SpinnerProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[styles.base, style]}
    >
      <ActivityIndicator size={SIZES[size].indicator} color={theme.primary} />
      {label ? <Text style={[typography.bodySmall, styles.label]}>{label}</Text> : null}
    </View>
  );
};
