/**
 * DailyDock — App Entry Point
 *
 * Root component with all providers (GestureHandler, SafeArea, Theme, Ads).
 */

import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme';
import { RootNavigator } from '../navigation/RootNavigator';
import { useSettingsStore } from '../features/settings/store/settingsStore';
import { initializeNotifications } from '../services/notifications';
import { initializeAds } from '../services/ads';
import BootSplash from 'react-native-bootsplash';

function AppContent() {
  const themeMode = useSettingsStore(s => s.themeMode);
  const setThemeMode = useSettingsStore(s => s.setThemeMode);
  const premiumThemeId = useSettingsStore(s => s.premiumThemeId);

  useEffect(() => {
    // Initialize services on app start
    initializeNotifications().catch(console.warn);
    initializeAds().catch(console.warn);
    BootSplash.hide({ fade: true }).catch(console.warn);
  }, []);

  return (
    <ThemeProvider
      initialMode={themeMode}
      initialPremiumThemeId={premiumThemeId}
      onModeChange={setThemeMode}
    >
      <RootNavigator />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
