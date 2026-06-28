/**
 * DailyDock Design System — Spacing Tokens
 *
 * 4px base grid system for consistent spacing throughout the app.
 * All values are multiples of 4.
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 375;

/** Scale a dimension based on screen width */
export function scale(size: number): number {
  const ratio = SCREEN_WIDTH / DESIGN_WIDTH;
  const newSize = size * ratio;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/** Vertical scale based on screen height */
export function verticalScale(size: number): number {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const DESIGN_HEIGHT = 812; // iPhone 12/13 base design height
  const ratio = SCREEN_HEIGHT / DESIGN_HEIGHT;
  const newSize = size * ratio;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/** Spacing tokens — use these instead of raw numbers */
export const spacing = {
  /** 2px — hairline spacing */
  xxs: 2,
  /** 4px — minimal spacing */
  xs: 4,
  /** 8px — tight spacing */
  sm: 8,
  /** 12px — compact spacing */
  md: 12,
  /** 16px — standard spacing */
  lg: 16,
  /** 20px — comfortable spacing */
  xl: 20,
  /** 24px — generous spacing */
  '2xl': 24,
  /** 32px — section spacing */
  '3xl': 32,
  /** 40px — large section spacing */
  '4xl': 40,
  /** 48px — component spacing */
  '5xl': 48,
  /** 64px — screen-level spacing */
  '6xl': 64,
} as const;

/** Screen padding (responsive) */
export const screenPadding = {
  horizontal: scale(20),
  vertical: scale(16),
  top: scale(12),
  bottom: scale(24),
};

/** Hit slop for accessible touch targets (min 44px) */
export const hitSlop = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};

export type Spacing = typeof spacing;
