/**
 * Colour tokens — design/foundations/colors.md.
 *
 * colors.md lists exactly seven dark-mode tokens and states that the remaining
 * ones "se derivan de los mismos valores base ajustando luminosidad para
 * mantener el contraste mínimo AA". Those derived values do not exist yet, so
 * `dark` reuses the light values for the unspecified keys: it keeps the two
 * palettes structurally identical (so `useTheme()` returns one predictable type)
 * rather than inventing hex values the design system has not approved.
 * See logs/mobile-design-applied-2026-09-17.md — GAP 1.
 */
const light = {
  background: '#F7F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0ED',
  primary: '#6BC5A8',
  primaryDark: '#4FA88C',
  primarySoft: '#E8F5F0',
  secondary: '#A8B8E8',
  secondarySoft: '#EEF1FA',
  accent: '#E8B8D8',
  accentSoft: '#F8E8F4',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textInverse: '#FFFFFF',
  border: '#E8E8E5',
  borderStrong: '#D0D0CC',
  error: '#E88B8B',
  errorSoft: '#F8E8E8',
  success: '#8BC9A8',
  successSoft: '#E8F5EE',
  warning: '#F5C88B',
  warningSoft: '#FCF4E5',
  info: '#8BB8E8',
  infoSoft: '#E8F0FA',
} as const;

/** The only dark tokens colors.md defines. */
const darkOverrides = {
  background: '#0F1419',
  surface: '#1A1F26',
  surfaceAlt: '#232A33',
  primary: '#6BC5A8',
  text: '#F5F5F5',
  textMuted: '#A0A0A0',
  border: '#2A3038',
} as const;

const dark = { ...light, ...darkOverrides } as const;

/**
 * Both palettes share this shape, so `useTheme()` has a single return type
 * instead of a union of two literal object types (which would make every token
 * access a type error on one of the branches).
 */
export type ColorTokens = { [K in keyof typeof light]: string };

export const colors: { light: ColorTokens; dark: ColorTokens } = {
  light,
  dark,
};
