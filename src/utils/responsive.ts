/**
 * DailyDock — Responsive Utility Functions
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

/** Scale based on screen width */
export function scale(size: number): number {
  return Math.round(
    PixelRatio.roundToNearestPixel((SCREEN_WIDTH / DESIGN_WIDTH) * size),
  );
}

/** Scale based on screen height */
export function verticalScale(size: number): number {
  return Math.round(
    PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / DESIGN_HEIGHT) * size),
  );
}

/** Moderate scale — less aggressive, good for text */
export function moderateScale(size: number, factor: number = 0.3): number {
  const scaleRatio = SCREEN_WIDTH / DESIGN_WIDTH;
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (scaleRatio - 1) * size * factor),
  );
}

export type Breakpoint = 'compact' | 'normal' | 'large' | 'tablet';

/** Get current breakpoint based on screen width */
export function getBreakpoint(): Breakpoint {
  if (SCREEN_WIDTH >= 600) return 'tablet';
  if (SCREEN_WIDTH >= 414) return 'large';
  if (SCREEN_WIDTH >= 360) return 'normal';
  return 'compact';
}

/** Check if device is a tablet */
export function isTablet(): boolean {
  return getBreakpoint() === 'tablet';
}

/** Get number of columns based on screen size */
export function getColumns(base: number = 1): number {
  const bp = getBreakpoint();
  if (bp === 'tablet') return base * 2;
  return base;
}
