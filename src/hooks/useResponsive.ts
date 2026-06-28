/**
 * DailyDock — Responsive Hook
 */

import { useMemo } from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
  getBreakpoint,
  isTablet,
  getColumns,
  type Breakpoint,
} from '../utils/responsive';

interface ResponsiveValues {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isTablet: boolean;
  columns: (base?: number) => number;
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  return useMemo<ResponsiveValues>(
    () => ({
      width,
      height,
      breakpoint: getBreakpoint(),
      isTablet: isTablet(),
      columns: getColumns,
      scale,
      verticalScale,
      moderateScale,
    }),
    [width, height],
  );
}
