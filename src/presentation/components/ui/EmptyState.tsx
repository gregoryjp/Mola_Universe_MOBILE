import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Mascot } from '@presentation/components/brand/Mascot';
import type { ReactNode } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  /**
   * Element 1 of states.md. Defaults to Meow, which brand-guide.md uses to
   * accompany an empty state, and which also fills element 1 where a caller
   * passed nothing. Pass a Lucide icon to override it.
   */
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
      {icon ?? <Mascot />}
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
