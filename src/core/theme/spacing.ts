/**
 * Spacing scale — design/foundations/spacing.md. Atomic scale on a 4px base;
 * the token names mirror the `space-N` names in the doc.
 */
export const spacing = {
  s0: 0,
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  s10: 40,
  s12: 48,
  s16: 64,
  s20: 80,
  s24: 96,
  s32: 128,
} as const;

export type SpacingTokens = typeof spacing;
