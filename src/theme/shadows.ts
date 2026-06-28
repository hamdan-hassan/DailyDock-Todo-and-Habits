/**
 * DailyDock Design System — Shadows
 *
 * Platform-specific shadow definitions for elevation levels.
 * Android uses elevation, iOS uses shadow* properties.
 */

import { Platform, ViewStyle } from 'react-native';

export interface ShadowLevel {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

function createShadow(
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {
      elevation,
    },
  }) as ViewStyle;
}

export const shadows = {
  /** Subtle shadow for flat cards */
  sm: createShadow('#000000', 1, 0.05, 3, 1),

  /** Standard card shadow */
  md: createShadow('#000000', 2, 0.08, 8, 3),

  /** Elevated elements, floating buttons */
  lg: createShadow('#000000', 4, 0.12, 16, 6),

  /** Prominent elements, modals */
  xl: createShadow('#000000', 8, 0.15, 24, 10),

  /** No shadow */
  none: createShadow('transparent', 0, 0, 0, 0),
} as const;

/** Dark mode shadows (more subtle) */
export const darkShadows = {
  sm: createShadow('#000000', 1, 0.3, 3, 1),
  md: createShadow('#000000', 2, 0.4, 8, 3),
  lg: createShadow('#000000', 4, 0.5, 16, 6),
  xl: createShadow('#000000', 8, 0.6, 24, 10),
  none: createShadow('transparent', 0, 0, 0, 0),
} as const;

export type Shadows = typeof shadows;
