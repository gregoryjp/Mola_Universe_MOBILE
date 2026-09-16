import { brandAssets } from '@shared/assets/brand';
import type { JSX } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

interface BrandLogoProps {
  width?: number;
  style?: StyleProp<ImageStyle>;
}

/** Intrinsic size of design/brand/logo-primary.svg. */
const LOGO_WIDTH = 170;
const LOGO_HEIGHT = 39;

/**
 * The MOLA wordmark from `design/brand/logo-primary.svg` (170x39).
 *
 * The source mark is a dark navy, so it is legible on `background` and `surface`
 * in light mode only (5.86:1 measured). There is no light variant yet, which is
 * why dark mode cannot show it — see GAP 7 in
 * logs/mobile-design-applied-2026-09-17.md. `app.json` still pins
 * `userInterfaceStyle: "light"`, so this only affects web today.
 */
export const BrandLogo = ({ width = LOGO_WIDTH, style }: BrandLogoProps): JSX.Element => (
  <Image
    source={brandAssets.logoPrimary}
    resizeMode="contain"
    accessibilityRole="image"
    accessibilityLabel="MOLA"
    style={[{ width, height: (width * LOGO_HEIGHT) / LOGO_WIDTH }, style]}
  />
);
