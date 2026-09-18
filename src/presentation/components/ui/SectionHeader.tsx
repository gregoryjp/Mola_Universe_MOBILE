import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { JSX } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  /**
   * How many items the section actually holds. Omit it rather than pass a
   * placeholder — a header that says "0" next to visible rows is worse than no
   * count at all.
   */
  count?: number;
  /** Renders a compact text action on the right. Both are required together. */
  actionLabel?: string;
  onAction?: () => void;
  /** Falls back to `actionLabel` when the visible text and the spoken one match. */
  actionAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The section label used across Hoy and Tareas.
 *
 * It carries hierarchy with type and space only — no card, no fill, no colour —
 * which is what lets MOLA read as MOLA with the logo hidden. `overline` is the
 * system's only token with tracking and uppercase, so the label sits clearly
 * below the content titles without needing a heavier weight.
 */
export const SectionHeader = ({
  title,
  count,
  actionLabel,
  onAction,
  actionAccessibilityLabel,
  style,
  testID,
}: SectionHeaderProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.row, style]} testID={testID}>
      <View style={styles.titleGroup}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {count !== undefined ? (
          <Text style={styles.count} testID={testID ? `${testID}-count` : undefined}>
            {count}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.action}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          testID={testID ? `${testID}-action` : undefined}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: spacing.s3,
    minHeight: 32,
  },
  titleGroup: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: spacing.s2,
    flexShrink: 1,
  },
  title: {
    ...typography.overline,
    color: theme.textMuted,
    flexShrink: 1,
  },
  count: {
    ...typography.overline,
    color: theme.textMuted,
  },
  // 12 + a 20px line + 12 is the 44px minimum target, achieved with padding
  // rather than hitSlop so it holds for both pointer and touch.
  action: {
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s1,
    flexShrink: 0,
  },
  actionText: {
    ...typography.bodySmall,
    color: theme.text,
    textDecorationLine: 'underline' as const,
  },
});
