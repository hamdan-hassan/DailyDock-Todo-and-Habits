/**
 * DailyDock Design System — Animation Presets
 *
 * Reusable animation configurations for Reanimated 4.x.
 */

import {
  withSpring,
  withTiming,
  type WithSpringConfig,
  type WithTimingConfig,
  Easing,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeOutDown,
  FadeInUp,
  FadeOutUp,
  SlideInRight,
  SlideOutRight,
  SlideInDown,
  SlideOutDown,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';

/** Spring presets */
export const springConfigs = {
  /** Snappy interactions (buttons, toggles) */
  snappy: {
    damping: 15,
    stiffness: 300,
    mass: 0.8,
  } satisfies WithSpringConfig,

  /** Gentle transitions (cards, modals) */
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  } satisfies WithSpringConfig,

  /** Bouncy emphasis (badges, celebrations) */
  bouncy: {
    damping: 8,
    stiffness: 200,
    mass: 0.6,
  } satisfies WithSpringConfig,

  /** Soft (subtle feedback) */
  soft: {
    damping: 25,
    stiffness: 100,
    mass: 1.2,
  } satisfies WithSpringConfig,
} as const;

/** Timing presets */
export const timingConfigs = {
  /** Fast transitions (100ms) */
  fast: {
    duration: 100,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,

  /** Standard transitions (200ms) */
  normal: {
    duration: 200,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,

  /** Slow transitions (350ms) */
  slow: {
    duration: 350,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,

  /** Emphasis (400ms with ease-out) */
  emphasis: {
    duration: 400,
    easing: Easing.bezier(0.0, 0.0, 0.2, 1),
  } satisfies WithTimingConfig,
} as const;

/** Layout animation presets */
export const layoutAnimations = {
  /** Smooth layout changes */
  layout: LinearTransition.springify()
    .damping(20)
    .stiffness(150),

  /** Entering animations */
  enter: {
    fadeIn: FadeIn.duration(250),
    fadeInDown: FadeInDown.duration(300).springify(),
    fadeInUp: FadeInUp.duration(300).springify(),
    slideInRight: SlideInRight.duration(300).springify(),
    slideInDown: SlideInDown.duration(300).springify(),
  },

  /** Exiting animations */
  exit: {
    fadeOut: FadeOut.duration(200),
    fadeOutDown: FadeOutDown.duration(250),
    fadeOutUp: FadeOutUp.duration(250),
    slideOutRight: SlideOutRight.duration(250),
    slideOutDown: SlideOutDown.duration(250),
  },
} as const;

/** Scale values for press animations */
export const pressScale = {
  light: 0.98,
  medium: 0.95,
  heavy: 0.9,
} as const;
