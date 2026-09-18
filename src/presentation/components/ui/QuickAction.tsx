import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import type { ComponentType, JSX } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export interface QuickActionIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export interface QuickActionProps {
  icon: ComponentType<QuickActionIconProps>;
  label: string;
  onPress: () => void;
  /** Overrides the spoken label when the visible one needs more context. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A compact capture intent — one icon, one short label.
 *
 * Deliberately not a `Button`: a row of four full-width green buttons is what
 * this replaces. The icon is drawn in `text` rather than an accent token so it
 * clears 3:1 on every surface (the chromatic tokens top out at 2.87:1, TD-040);
 * identity here comes from the shape and spacing, not from a colour.
 */
export const QuickAction = ({
  icon: Icon,
  label,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: QuickActionProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.tile, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
    >
      {/* 44px square: the icon tile is itself the minimum touch target. */}
      <View style={styles.iconBox}>
        <Icon size={20} strokeWidth={2} color={theme.text} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  tile: {
    alignItems: 'center' as const,
    gap: spacing.s2,
    paddingVertical: spacing.s2,
    // Four fit a 360px phone (4 x 72 + 3 x 8 gutter); narrower screens wrap to
    // three plus one rather than clipping, since callers lay these out in a
    // wrapping row.
    flexBasis: 72,
    flexGrow: 1,
    maxWidth: 128,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceAlt,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  label: {
    ...typography.caption,
    color: theme.text,
    textAlign: 'center' as const,
  },
});
