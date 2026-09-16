import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { ReactNode } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  /** A Lucide icon; the caller picks it because the icon set is not fixed here. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Renders the CTA from design/components/states.md. */
  actionLabel?: string;
  onAction?: () => void;
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
  title: { color: theme.text, textAlign: 'center' as const },
  description: { color: theme.textMuted, textAlign: 'center' as const },
});

/** Composition required by states.md: icon, title, description, CTA. */
export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
  testID,
}: EmptyStateProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View testID={testID} style={[styles.base, style]}>
      {icon}
      <Text style={[typography.h4, styles.title]}>{title}</Text>
      {description ? (
        <Text style={[typography.bodySmall, styles.description]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
};
