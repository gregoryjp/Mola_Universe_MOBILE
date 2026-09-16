import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { ReactNode } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { Button } from './Button';

interface ErrorStateProps {
  /** A Lucide icon; the caller picks it because the icon set is not fixed here. */
  icon?: ReactNode;
  message: string;
  /** Only rendered when `onRetry` is given — states.md requires a retry button. */
  retryLabel?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const makeStyles = (theme: ColorTokens) => ({
  base: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.s3,
    paddingVertical: spacing.s8,
    paddingHorizontal: spacing.s4,
  },
  message: { color: theme.textMuted, textAlign: 'center' as const },
});

/** Composition required by states.md: icon, message, retry. */
export const ErrorState = ({
  icon,
  message,
  retryLabel = 'Reintentar',
  onRetry,
  style,
  testID,
}: ErrorStateProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View testID={testID} accessibilityRole="alert" style={[styles.base, style]}>
      {icon}
      <Text style={[typography.bodySmall, styles.message]}>{message}</Text>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
};
