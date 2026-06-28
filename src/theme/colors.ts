/**
 * DailyDock Design System — Color Tokens
 *
 * Premium palette inspired by Things 3, Linear, and Apple Reminders.
 * Each color has semantic meaning and is available in light/dark variants.
 */

export const palette = {
  // Brand
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  violet400: '#A78BFA',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  gray950: '#020617',
  black: '#000000',

  // Semantic
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',

  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  sky400: '#38BDF8',
  sky500: '#0EA5E9',
  sky600: '#0284C7',

  rose400: '#FB7185',
  rose500: '#F43F5E',

  orange400: '#FB923C',
  orange500: '#F97316',

  teal400: '#2DD4BF',
  teal500: '#14B8A6',
} as const;

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textOnPrimary: string;

  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // UI Elements
  border: string;
  borderFocused: string;
  divider: string;
  icon: string;
  iconSecondary: string;
  placeholder: string;
  overlay: string;

  // Tab Bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Priority Colors
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  priorityUrgent: string;

  // Category Colors
  categoryPersonal: string;
  categoryWork: string;
  categorySchool: string;
  categoryHealth: string;
  categoryShopping: string;
  categoryCustom: string;

  // Gradient
  gradientStart: string;
  gradientEnd: string;

  // Streak
  streakFire: string;
  streakGlow: string;
}

export const lightColors: ThemeColors = {
  // Backgrounds
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfacePressed: palette.gray100,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textOnPrimary: palette.white,

  // Brand
  primary: palette.indigo600,
  primaryLight: palette.indigo100,
  primaryDark: palette.indigo700,

  // Semantic
  success: palette.emerald500,
  successLight: '#D1FAE5',
  warning: palette.amber500,
  warningLight: '#FEF3C7',
  error: palette.red500,
  errorLight: '#FEE2E2',
  info: palette.sky500,
  infoLight: '#E0F2FE',

  // UI Elements
  border: palette.gray200,
  borderFocused: palette.indigo500,
  divider: palette.gray100,
  icon: palette.gray600,
  iconSecondary: palette.gray400,
  placeholder: palette.gray400,
  overlay: 'rgba(15, 23, 42, 0.5)',

  // Tab Bar
  tabBarBackground: palette.white,
  tabBarBorder: palette.gray200,
  tabBarActive: palette.indigo600,
  tabBarInactive: palette.gray400,

  // Priority Colors
  priorityLow: palette.sky500,
  priorityMedium: palette.amber500,
  priorityHigh: palette.orange500,
  priorityUrgent: palette.red500,

  // Category Colors
  categoryPersonal: palette.violet500,
  categoryWork: palette.indigo500,
  categorySchool: palette.sky500,
  categoryHealth: palette.emerald500,
  categoryShopping: palette.rose500,
  categoryCustom: palette.teal500,

  // Gradient
  gradientStart: palette.indigo500,
  gradientEnd: palette.violet500,

  // Streak
  streakFire: palette.orange500,
  streakGlow: '#FFF7ED',
};

export const darkColors: ThemeColors = {
  // Backgrounds
  background: palette.gray950,
  surface: palette.gray900,
  surfaceElevated: palette.gray800,
  surfacePressed: palette.gray700,

  // Text
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,
  textOnPrimary: palette.white,

  // Brand
  primary: palette.indigo400,
  primaryLight: 'rgba(99, 102, 241, 0.15)',
  primaryDark: palette.indigo500,

  // Semantic
  success: palette.emerald400,
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: palette.amber400,
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: palette.red400,
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: palette.sky400,
  infoLight: 'rgba(14, 165, 233, 0.15)',

  // UI Elements
  border: palette.gray700,
  borderFocused: palette.indigo400,
  divider: palette.gray800,
  icon: palette.gray400,
  iconSecondary: palette.gray500,
  placeholder: palette.gray500,
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Tab Bar
  tabBarBackground: palette.gray900,
  tabBarBorder: palette.gray800,
  tabBarActive: palette.indigo400,
  tabBarInactive: palette.gray500,

  // Priority Colors
  priorityLow: palette.sky400,
  priorityMedium: palette.amber400,
  priorityHigh: palette.orange400,
  priorityUrgent: palette.red400,

  // Category Colors
  categoryPersonal: palette.violet400,
  categoryWork: palette.indigo400,
  categorySchool: palette.sky400,
  categoryHealth: palette.emerald400,
  categoryShopping: palette.rose400,
  categoryCustom: palette.teal400,

  // Gradient
  gradientStart: palette.indigo400,
  gradientEnd: palette.violet400,

  // Streak
  streakFire: palette.orange400,
  streakGlow: 'rgba(249, 115, 22, 0.15)',
};
