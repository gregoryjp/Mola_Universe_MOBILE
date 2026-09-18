import type { ColorTokens } from '@core/theme';
import { colors, radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import { ActivityIndicator, Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'primaryTonal'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'link'
  | 'linkNeutral';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Icons or any node rendered before the label. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Heights and horizontal padding per size. These values are defined here: the
 * guide they were meant to come from, design/components/buttons.md, does not
 * exist in the repo yet (TD-020).
 */
const SIZES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; text: 'bodySmall' | 'body' | 'bodyLarge' }
> = {
  sm: { height: 32, paddingHorizontal: 12, text: 'bodySmall' },
  md: { height: 40, paddingHorizontal: 16, text: 'body' },
  lg: { height: 48, paddingHorizontal: 24, text: 'body' },
  xl: { height: 56, paddingHorizontal: 32, text: 'bodyLarge' },
};

/**
 * Targeted touch size. 44x44 is the value the accessibility guide is expected
 * to require, but accessibility/guidelines.md does not exist in the repo yet,
 * so it is a working assumption here rather than a citation (TD-020). `sm` (32)
 * and `md` (40) fall short, so the missing area is added with hitSlop instead
 * of growing the visual control; `lg` (48) and `xl` (56) already clear it.
 */
const MIN_TOUCH_TARGET = 44;

/**
 * Ink that pairs with `primary`, in either scheme. `primary` is not overridden
 * by the dark palette, so `theme.text` — which flips to near-white there — would
 * leave the tonal label at 1.89:1 (measured in the running app). #1A1A1A sits at
 * 8.43:1 on the green in both schemes, so the ink has to be as scheme-independent
 * as the fill it sits on.
 */
const ON_PRIMARY_INK = colors.light.text;

/**
 * Spinner ink per variant: dark on light fills, white on solid ones, brand on
 * transparent ones. A map instead of a chain of ternaries so adding a variant
 * cannot silently inherit the wrong colour.
 */
const SPINNER_INK: Record<ButtonVariant, (theme: ColorTokens) => string> = {
  primary: (theme) => theme.textInverse,
  primaryTonal: () => ON_PRIMARY_INK,
  secondary: (theme) => theme.primary,
  ghost: (theme) => theme.primary,
  danger: (theme) => theme.textInverse,
  success: (theme) => theme.textInverse,
  link: (theme) => theme.primary,
  linkNeutral: (theme) => theme.text,
};

/**
 * `primary` fills with the brand green and writes the label in white, which
 * measures 2.06:1 — below AA on every light surface (TD-040). `primaryTonal`
 * and `linkNeutral` are the two additive, AA-compliant action treatments the
 * Auth checkpoint needs; they reuse `primary` and `text` unchanged, so the
 * designer's TD-040 decision is not pre-empted (the existing `primary`/`link`
 * keep their current values):
 *
 * - `primaryTonal`  green fill + `text` ink  = 8.43:1 (AAA)
 * - `linkNeutral`   `text` ink + underline   = 16.23:1 (AAA) on `background`
 */
const makeStyles = (theme: ColorTokens) => ({
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.s2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: theme.primary },
  primaryTonal: { backgroundColor: theme.primary },
  secondary: { backgroundColor: 'transparent', borderColor: theme.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: theme.error },
  success: { backgroundColor: theme.success },
  link: { backgroundColor: 'transparent' },
  linkNeutral: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  textPrimary: { color: theme.textInverse },
  textTonal: { color: ON_PRIMARY_INK },
  textOutline: { color: theme.primary },
  textDanger: { color: theme.textInverse },
  textSuccess: { color: theme.textInverse },
  textLink: { color: theme.primary, textDecorationLine: 'underline' as const },
  textLinkNeutral: { color: theme.text, textDecorationLine: 'underline' as const },
});

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leading,
  trailing,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const dimensions = SIZES[size];
  const blocked = disabled || loading;

  const textStyle = {
    primary: styles.textPrimary,
    primaryTonal: styles.textTonal,
    secondary: styles.textOutline,
    ghost: styles.textOutline,
    danger: styles.textDanger,
    success: styles.textSuccess,
    link: styles.textLink,
    linkNeutral: styles.textLinkNeutral,
  }[variant];

  const minTouchTarget = Math.max(0, MIN_TOUCH_TARGET - dimensions.height) / 2;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      hitSlop={minTouchTarget > 0 ? minTouchTarget : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        { height: dimensions.height, paddingHorizontal: dimensions.paddingHorizontal },
        pressed && !blocked ? styles.disabled : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={SPINNER_INK[variant](theme)} /> : leading}
      <Text style={[typography[dimensions.text], textStyle]} numberOfLines={1}>
        {label}
      </Text>
      {loading ? null : trailing}
    </Pressable>
  );
};
