/**
 * Radius tokens — design/foundations/radius.md.
 *
 * Doc mapping: buttons/inputs `md`, small inputs & chips `sm`, small cards `lg`,
 * large cards & modals `xl`, avatars & circular buttons `full`, badges `xs`.
 */
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusTokens = typeof radius;
