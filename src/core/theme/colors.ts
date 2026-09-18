/**
 * Colour tokens — design/foundations/colors.md.
 *
 * colors.md lists seven dark-mode tokens and states that the remaining ones "se
 * derivan de los mismos valores base ajustando luminosidad para mantener el
 * contraste mínimo AA". This file now implements that derivation instead of
 * silently reusing the light values (TD-044: reused light tints left `Card
 * variant="pastel"` at 1.00–1.09:1 in dark mode — invisible text).
 *
 * Derivation rule, applied mechanically so no value is eyeballed:
 *   - chromatic `*Soft` fills: keep the light token's HUE, set lightness to
 *     0.22, scale saturation by 1.9 (capped at 0.45) so the hue still reads at
 *     that lightness. This lands every tint at 1.20:1 or better against
 *     `surface` — i.e. at least as distinct from `surface` as `surfaceAlt` is —
 *     while `text` on it stays at 8.36:1 or better.
 *   - neutrals (`borderStrong`): keep hue AND saturation (it is a near-neutral,
 *     scaling its saturation would give it a colour cast), move lightness only.
 *   - chromatic accents (`primary`, `secondary`, `accent`, `success`, `warning`,
 *     `error`, `info`): the light pastel values are kept verbatim. Measured as
 *     TEXT on the dark surface they clear AA comfortably (6.70–11.92:1), so no
 *     dark variant is justified. They are declared explicitly rather than
 *     inherited, so the day someone changes one it is a deliberate edit.
 *
 * The two palettes are structurally identical and `dark` is annotated with
 * `ColorTokens`, so a missing key is a compile error, not a runtime
 * `undefined` background.
 *
 * Light-mode `text` on those same chromatic accents is a separate, pre-existing
 * problem (1.42–2.56:1) tracked as TD-040 — a palette decision for the designer,
 * not something this file may fix by inventing darker values.
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

/**
 * Both palettes share this shape, so `useTheme()` has a single return type
 * instead of a union of two literal object types (which would make every token
 * access a type error on one of the branches).
 */
export type ColorTokens = { [K in keyof typeof light]: string };

export type ColorTokenName = keyof typeof light;

/** The seven dark tokens colors.md actually specifies. */
const darkSpecified = {
  background: '#0F1419',
  surface: '#1A1F26',
  surfaceAlt: '#232A33',
  primary: '#6BC5A8',
  text: '#F5F5F5',
  textMuted: '#A0A0A0',
  border: '#2A3038',
} as const;

/** Derived by the rule in the header comment. See TD-044. */
const darkDerived = {
  primaryDark: '#4FA88C',
  primarySoft: '#1F513E',
  secondary: '#A8B8E8',
  secondarySoft: '#1F2B51',
  accent: '#E8B8D8',
  accentSoft: '#511F45',
  textInverse: '#FFFFFF',
  borderStrong: '#505049',
  error: '#E88B8B',
  errorSoft: '#511F1F',
  success: '#8BC9A8',
  successSoft: '#1F5136',
  warning: '#F5C88B',
  warningSoft: '#51401F',
  info: '#8BB8E8',
  infoSoft: '#1F3551',
} as const;

/** Annotated with `ColorTokens`, so an incomplete dark palette fails to compile. */
const dark: ColorTokens = { ...darkSpecified, ...darkDerived };

export const colors: { light: ColorTokens; dark: ColorTokens } = { light, dark };

/**
 * The seven supported `CardTone` values and the token each one fills with.
 *
 * This lives in the colour layer because it IS the colour contract: it is what
 * makes "a supported tone can never point at a token that does not exist in
 * both palettes" checkable. `Card` derives its `tone` prop from this map, so
 * the two cannot drift apart.
 */
export const cardToneBackground = {
  primary: 'primarySoft',
  secondary: 'secondarySoft',
  accent: 'accentSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  error: 'errorSoft',
  info: 'infoSoft',
} as const satisfies Record<string, ColorTokenName>;

export type CardTone = keyof typeof cardToneBackground;
