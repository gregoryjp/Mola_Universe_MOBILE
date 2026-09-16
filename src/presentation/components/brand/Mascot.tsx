import { brandAssets } from '@shared/assets/brand';
import type { JSX } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

interface MascotProps {
  width?: number;
  /** Pass a label only when Meow carries meaning the surrounding text does not. */
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
}

/** Intrinsic size of design/brand/mascot-meow.svg. */
const MASCOT_WIDTH = 375;
const MASCOT_HEIGHT = 520;

/**
 * Meow from `design/brand/mascot-meow.svg` (375x520). brand-guide.md uses it to
 * "acompañar un estado vacío" and to explain or suggest an action.
 *
 * It is decorative by default: in an empty state the title already says what is
 * happening, so announcing "Meow" too would only add noise for screen readers.
 */
export const Mascot = ({ width = 120, accessibilityLabel, style }: MascotProps): JSX.Element => (
  <Image
    source={brandAssets.mascotMeow}
    resizeMode="contain"
    accessible={accessibilityLabel !== undefined}
    accessibilityRole={accessibilityLabel ? 'image' : 'none'}
    accessibilityLabel={accessibilityLabel}
    importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    style={[{ width, height: (width * MASCOT_HEIGHT) / MASCOT_WIDTH }, style]}
  />
);
