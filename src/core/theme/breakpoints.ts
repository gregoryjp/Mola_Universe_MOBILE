/**
 * Breakpoints — design/foundations/breakpoints.md. Mobile-first: the values mark
 * where the layout steps up (columns, padding and gap all change).
 */
export const breakpoints = {
  mobileSmall: 320,
  mobile: 375,
  mobileLarge: 430,
  tabletSmall: 481,
  tablet: 769,
  desktop: 1025,
} as const;

/** Horizontal padding per breakpoint, from the doc's table. */
export const breakpointPadding = {
  mobileSmall: 16,
  mobile: 16,
  mobileLarge: 20,
  tabletSmall: 24,
  tablet: 24,
  desktop: 32,
} as const;

export const isTablet = (width: number): boolean => width >= breakpoints.tabletSmall;
export const isDesktop = (width: number): boolean => width >= breakpoints.desktop;
