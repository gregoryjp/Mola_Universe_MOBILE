import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';

interface ChipProps {
  label: string;
  /** Toggled/active look — filter pills and category tiles both use this. */
  selected?: boolean;
  onPress?: () => void;
  /** Icon or any node rendered before the label. */
  leading?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * No design-system doc defines a Chip yet (same gap Divider.tsx already notes),
 * so this composes the minimum that reads as one from existing tokens: `sm`
 * radius (chips share it with small inputs per radius.md), `border`/`primary`
 * for the unselected/selected states mirroring Badge's outlined look.
 */
const makeStyles = (theme: ColorTokens) => ({
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    gap: spacing.s1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.sm,
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
  },
  selected: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  pressed: { opacity: 0.85 },
  label: { color: theme.textMuted },
  labelSelected: { color: theme.primaryDark },
});

export const Chip = ({
  label,
  selected = false,
  onPress,
  leading,
  accessibilityLabel,
  style,
  testID,
}: ChipProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : null,
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {leading}
      <Text
        style={[typography.bodySmall, selected ? styles.labelSelected : styles.label]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};
