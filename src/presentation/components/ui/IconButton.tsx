import type { ColorTokens } from '@core/theme';
import { radius, useTheme, useThemedStyles } from '@core/theme';
import type { ComponentType } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type IconButtonSize = 32 | 40 | 48 | 56;
export type IconButtonVariant = 'default' | 'primary';

interface IconButtonProps {
  /** A `lucide-react-native` icon component, the same set FloatingTabBar uses. */
  icon: ComponentType<IconProps>;
  onPress: () => void;
  accessibilityLabel: string;
  size?: IconButtonSize;
  /** `primary` is for the rare screen where this icon button IS the single
   * primary CTA (e.g. a FAB) — everywhere else the neutral default applies. */
  variant?: IconButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Minimum accessible touch target, same value Button.tsx assumes (TD-020). */
const MIN_TOUCH_TARGET = 44;

const makeStyles = (theme: ColorTokens) => ({
  base: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: radius.full,
  },
  default: { backgroundColor: theme.surfaceAlt },
  primary: { backgroundColor: theme.primary },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
});

export const IconButton = ({
  icon: Icon,
  onPress,
  accessibilityLabel,
  size = 40,
  variant = 'default',
  disabled = false,
  style,
  testID,
}: IconButtonProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const iconColor = variant === 'primary' ? theme.textInverse : theme.text;
  const hitSlop = Math.max(0, Math.round((MIN_TOUCH_TARGET - size) / 2));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={hitSlop > 0 ? hitSlop : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        { width: size, height: size },
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} color={iconColor} />
    </Pressable>
  );
};
