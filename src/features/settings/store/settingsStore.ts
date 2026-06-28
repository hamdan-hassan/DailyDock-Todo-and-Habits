/**
 * DailyDock — Settings Store (Zustand + MMKV)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../../../services/storage';
import type { ThemeMode } from '../../../theme';

interface SettingsState {
  themeMode: ThemeMode;
  premiumThemeId: string | null;
  notificationsEnabled: boolean;
  unlockedThemeIds: string[];
  setThemeMode: (mode: ThemeMode) => void;
  setPremiumThemeId: (id: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  unlockTheme: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      premiumThemeId: null,
      notificationsEnabled: true,
      unlockedThemeIds: [],

      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      setPremiumThemeId: (id: string | null) => set({ premiumThemeId: id }),
      setNotificationsEnabled: (enabled: boolean) =>
        set({ notificationsEnabled: enabled }),
      unlockTheme: (id: string) => set((state) => ({ unlockedThemeIds: [...new Set([...state.unlockedThemeIds, id])] })),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => createMMKVStorage('settings')),
    },
  ),
);
