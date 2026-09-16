/**
 * Type tokens — design/foundations/typography.md.
 *
 * The doc's base scale is the desktop one (display 56, h1 40, h2 32); its
 * breakpoint table overrides those three down to 40/32/24 on mobile, which is
 * what this file holds since the app is mobile-first. The remaining styles stay
 * fixed across breakpoints.
 *
 * GAP 2: typography.md names Inter as the only family of the system, but the
 * app has not loaded it yet (needs expo-font + the font files). Setting
 * fontFamily without loading the font makes React Native fall back silently, so
 * the family token is exposed here and applied once the font is installed.
 */
export const fontFamily = 'Inter';

export const typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '800' as const },
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  h4: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyTokens = typeof typography;
