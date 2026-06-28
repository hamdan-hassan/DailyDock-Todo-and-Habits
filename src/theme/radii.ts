/**
 * DailyDock Design System — Border Radius Tokens
 */

export const radii = {
  /** 4px — subtle rounding */
  xs: 4,
  /** 6px — small rounding */
  sm: 6,
  /** 10px — standard rounding */
  md: 10,
  /** 14px — card rounding */
  lg: 14,
  /** 20px — prominent rounding */
  xl: 20,
  /** 28px — large rounding */
  '2xl': 28,
  /** 9999px — fully circular */
  full: 9999,
} as const;

export type Radii = typeof radii;
