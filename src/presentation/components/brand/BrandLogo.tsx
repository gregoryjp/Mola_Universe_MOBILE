import { useIsDarkScheme } from '@core/theme';
import { brandAssets } from '@shared/assets/brand';
import type { JSX } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

interface BrandLogoProps {
  /** Width of the wordmark, and of the box the dark-scheme mark sits in. */
  width?: number;
  /** Square size of the mark used on the dark scheme. */
  darkSize?: number;
  style?: StyleProp<ImageStyle>;
}

/** Intrinsic size of design/brand/logo-primary.svg. */
const LOGO_WIDTH = 170;
const LOGO_HEIGHT = 39;

/**
 * The MOLA brand mark: the wordmark on light, `logo-icon` on dark.
 *
 * The wordmark is dark navy, so on the dark scheme it sits at 2.94:1 (measured)
 * and reads as invisible. `brand/logo-primary-light.svg` does not exist yet, so
 * dark falls back to the mark from `logo-icon.svg`, whose worst band still
 * clears 4.00:1 there. See GAP 7.
 *
 * Tinting the wordmark was tried first and dropped: react-native-web builds
 * `tintColor` as an SVG filter on mount only, and switching the scheme at
 * runtime left it untinted even with a forced remount (measured ink stayed
 * #757472 at 20.8% coverage, against 56.5% when tinted).
 */
export const BrandLogo = ({
  width = LOGO_WIDTH,
  darkSize = 88,
  style,
}: BrandLogoProps): JSX.Element => {
  const isDark = useIsDarkScheme();

  if (isDark) {
    return (
      <Image
        source={brandAssets.logoIcon}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="MOLA"
        style={[{ width: darkSize, height: darkSize }, style]}
      />
    );
  }

  return (
    <Image
      source={brandAssets.logoPrimary}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="MOLA"
      style={[{ width, height: (width * LOGO_HEIGHT) / LOGO_WIDTH }, style]}
    />
  );
};
