import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentType, JSX } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export interface NavRowIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export interface NavRowProps {
  icon: ComponentType<NavRowIconProps>;
  label: string;
  /** One short line under the label — what the destination actually does. */
  hint?: string;
  /** Right-aligned counter or state, e.g. "3". */
  meta?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * One navigable capability.
 *
 * This is what replaces the grid of tinted cards: a row reads as a list of
 * things you can do, keeps the tap target at 56px, and lets the group heading
 * above it carry the hierarchy. The icon tile is the single brand accent
 * repeated across the app rather than a colour per module.
 */
export const NavRow = ({
  icon: Icon,
  label,
  hint,
  meta,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: NavRowProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
    >
      <View style={styles.iconTile}>
        <Icon size={18} strokeWidth={2} color={styles.iconInk.color} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      <ChevronRight size={18} strokeWidth={2} color={styles.chevron.color} />
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
    minHeight: 56,
    paddingVertical: spacing.s2,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: theme.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  /**
   * `text` rather than `primaryDark`: the icon sits on `primarySoft`, where
   * `primaryDark` measures 2.6:1 and fails the 3:1 non-text minimum. `text`
   * measures 8.36:1 in both palettes, and the tile itself stays perceptible
   * against the page (2.03:1).
   */
  iconInk: {
    color: theme.text,
  },
  text: {
    flex: 1,
    gap: spacing.s0,
  },
  label: {
    ...typography.bodyLarge,
    color: theme.text,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  chevron: {
    color: theme.textMuted,
  },
});
