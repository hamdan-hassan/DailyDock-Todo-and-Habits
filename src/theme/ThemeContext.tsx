/**
 * DailyDock Design System — Theme Context & Provider
 *
 * Provides light/dark/system theme switching with MMKV persistence.
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { lightColors, darkColors, type ThemeColors } from './colors';
import { premiumThemes } from './premiumThemes';
import { createTypography, type Typography } from './typography';
import { shadows, darkShadows, type Shadows } from './shadows';
import { spacing, type Spacing } from './spacing';
import { radii, type Radii } from './radii';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  typography: Typography;
  shadows: Shadows;
  spacing: Spacing;
  radii: Radii;
}

interface ThemeContextValue {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
  premiumThemeId: string | null;
  setPremiumThemeId: (id: string | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
  initialPremiumThemeId?: string | null;
  onModeChange?: (mode: ThemeMode) => void;
}

export function ThemeProvider({
  children,
  initialMode = 'system',
  initialPremiumThemeId = null,
  onModeChange,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);
  const [premiumThemeId, setPremiumThemeId] = useState<string | null>(initialPremiumThemeId);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      onModeChange?.(mode);
    },
    [onModeChange],
  );

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = useMemo<Theme>(() => {
    const typography = createTypography();
    
    let currentColors = isDark ? darkColors : lightColors;
    if (premiumThemeId) {
      const premium = premiumThemes.find(t => t.id === premiumThemeId);
      if (premium) {
        currentColors = premium.colors;
      }
    }

    return {
      mode: themeMode,
      isDark,
      colors: currentColors,
      typography,
      shadows: isDark ? darkShadows : shadows,
      spacing,
      radii,
    };
  }, [isDark, themeMode, premiumThemeId]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setThemeMode,
      themeMode,
      premiumThemeId,
      setPremiumThemeId,
    }),
    [theme, setThemeMode, themeMode, premiumThemeId],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        animated
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx.theme;
}

export function useThemeMode(): {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  premiumThemeId: string | null;
  setPremiumThemeId: (id: string | null) => void;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return { 
    themeMode: ctx.themeMode, 
    setThemeMode: ctx.setThemeMode,
    premiumThemeId: ctx.premiumThemeId,
    setPremiumThemeId: ctx.setPremiumThemeId,
  };
}
