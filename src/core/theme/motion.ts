/**
 * Motion tokens — design/foundations/motion.md.
 *
 * Durations are plain milliseconds. React Native cannot consume the doc's CSS
 * `cubic-bezier(...)` strings, so the easings are exposed as control points:
 * call `Easing.bezier(...easings.out)` where an animated API needs one.
 *
 * Doc rules: nothing animates for longer than `durations.long`, animation is
 * only used where it aids comprehension or feedback, and `prefers-reduced-motion`
 * must be respected on every platform — check
 * `AccessibilityInfo.isReduceMotionEnabled()` before animating.
 */
export const durations = {
  micro: 150,
  short: 200,
  medium: 300,
  long: 500,
} as const;

export const easings = {
  /** Entrances. */
  out: [0, 0, 0.2, 1],
  /** Exits. */
  in: [0.4, 0, 1, 1],
  /** Transitions. */
  both: [0.4, 0, 0.2, 1],
} as const;
