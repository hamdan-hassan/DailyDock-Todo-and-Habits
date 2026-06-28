/**
 * DailyDock Design System — Typography
 *
 * Responsive font scales using moderateScale for cross-device consistency.
 * Uses Inter font family (loaded via react-native asset linking).
 */

import { Platform, PixelRatio, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 375; // iPhone 12/13 base design width

/**
 * Moderate scaling function for responsive font sizes.
 * factor controls how aggressively sizes scale with screen width.
 */
export function moderateScale(size: number, factor: number = 0.3): number {
  const scale = SCREEN_WIDTH / DESIGN_WIDTH;
  const newSize = size + (scale - 1) * size * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const fontFamilies = {
  regular: Platform.select({
    android: 'Inter-Regular',
    ios: 'Inter-Regular',
    default: 'Inter-Regular',
  }),
  medium: Platform.select({
    android: 'Inter-Medium',
    ios: 'Inter-Medium',
    default: 'Inter-Medium',
  }),
  semiBold: Platform.select({
    android: 'Inter-SemiBold',
    ios: 'Inter-SemiBold',
    default: 'Inter-SemiBold',
  }),
  bold: Platform.select({
    android: 'Inter-Bold',
    ios: 'Inter-Bold',
    default: 'Inter-Bold',
  }),
} as const;

export interface TextStyle {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  letterSpacing?: number;
}

/** Pre-computed typography styles. Call createTypography() once. */
export function createTypography() {
  return {
    /** Large title — screen headers */
    h1: {
      fontSize: moderateScale(28),
      lineHeight: moderateScale(34),
      fontFamily: fontFamilies.bold,
      letterSpacing: -0.5,
    } as TextStyle,

    /** Section headers */
    h2: {
      fontSize: moderateScale(22),
      lineHeight: moderateScale(28),
      fontFamily: fontFamilies.semiBold,
      letterSpacing: -0.3,
    } as TextStyle,

    /** Sub-section headers */
    h3: {
      fontSize: moderateScale(18),
      lineHeight: moderateScale(24),
      fontFamily: fontFamilies.semiBold,
      letterSpacing: -0.2,
    } as TextStyle,

    /** Card titles, important labels */
    h4: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(22),
      fontFamily: fontFamilies.medium,
      letterSpacing: -0.1,
    } as TextStyle,

    /** Primary body text */
    body: {
      fontSize: moderateScale(15),
      lineHeight: moderateScale(22),
      fontFamily: fontFamilies.regular,
      letterSpacing: 0,
    } as TextStyle,

    /** Secondary body text */
    bodySmall: {
      fontSize: moderateScale(13),
      lineHeight: moderateScale(18),
      fontFamily: fontFamilies.regular,
      letterSpacing: 0.1,
    } as TextStyle,

    /** Labels, chips, badges */
    label: {
      fontSize: moderateScale(12),
      lineHeight: moderateScale(16),
      fontFamily: fontFamilies.medium,
      letterSpacing: 0.3,
    } as TextStyle,

    /** Fine print, timestamps */
    caption: {
      fontSize: moderateScale(11),
      lineHeight: moderateScale(14),
      fontFamily: fontFamilies.regular,
      letterSpacing: 0.2,
    } as TextStyle,

    /** Button text */
    button: {
      fontSize: moderateScale(15),
      lineHeight: moderateScale(20),
      fontFamily: fontFamilies.semiBold,
      letterSpacing: 0.2,
    } as TextStyle,

    /** Large button / CTA */
    buttonLarge: {
      fontSize: moderateScale(17),
      lineHeight: moderateScale(22),
      fontFamily: fontFamilies.semiBold,
      letterSpacing: 0.1,
    } as TextStyle,

    /** Tab bar labels */
    tabLabel: {
      fontSize: moderateScale(10),
      lineHeight: moderateScale(12),
      fontFamily: fontFamilies.medium,
      letterSpacing: 0.3,
    } as TextStyle,

    /** Large stat numbers */
    stat: {
      fontSize: moderateScale(32),
      lineHeight: moderateScale(38),
      fontFamily: fontFamilies.bold,
      letterSpacing: -1,
    } as TextStyle,
  };
}

export type Typography = ReturnType<typeof createTypography>;
