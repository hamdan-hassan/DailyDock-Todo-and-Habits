/**
 * DailyDock — Settings Screen
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Alert, TextInput, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Section } from '../../../components/layout/Section';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useTheme, useThemeMode, type ThemeMode } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useSettingsStore } from '../store/settingsStore';
import { shareExportedData, importDataFromFile, saveExportedDataToDevice } from '../../../services/dataExport';
import { clearAllStores } from '../../../services/storage';
import { shouldShowAds, getBannerAdUnitId, showRewardedAd } from '../../../services/ads';
import { haptics } from '../../../services/haptics';
import { requestPermissions } from '../../../services/notifications';
import { premiumThemes } from '../../../theme/premiumThemes';

export function SettingsScreen() {
  const { colors, typography } = useTheme();
  const { themeMode, setThemeMode, premiumThemeId, setPremiumThemeId } = useThemeMode();

  const notificationsEnabled = useSettingsStore(s => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore(s => s.setNotificationsEnabled);
  const settingsSetTheme = useSettingsStore(s => s.setThemeMode);
  
  const unlockedThemeIds = useSettingsStore(s => s.unlockedThemeIds);
  const unlockTheme = useSettingsStore(s => s.unlockTheme);
  const settingsSetPremiumThemeId = useSettingsStore(s => s.setPremiumThemeId);

  const handleThemeChange = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      settingsSetTheme(mode);
      setPremiumThemeId(null);
      settingsSetPremiumThemeId(null);
      haptics.selection();
    },
    [setThemeMode, settingsSetTheme, setPremiumThemeId, settingsSetPremiumThemeId],
  );

  const handlePremiumThemeSelect = useCallback(
    (id: string) => {
      setPremiumThemeId(id);
      settingsSetPremiumThemeId(id);
      haptics.selection();
    },
    [setPremiumThemeId, settingsSetPremiumThemeId]
  );

  const handleUnlockTheme = useCallback((themeId: string, themeName: string) => {
    Alert.alert(`Unlock ${themeName}?`, `Watch a short video ad to permanently unlock the ${themeName} theme?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Watch Ad', 
        onPress: () => {
          showRewardedAd(() => {
            unlockTheme(themeId);
            setPremiumThemeId(themeId);
            settingsSetPremiumThemeId(themeId);
            haptics.notificationSuccess();
            Alert.alert('Unlocked!', `${themeName} theme is now available and active.`);
          });
        }
      }
    ]);
  }, [unlockTheme, setPremiumThemeId, settingsSetPremiumThemeId]);

  const handleSaveToDevice = useCallback(async () => {
    const success = await saveExportedDataToDevice();
    if (success) {
      Alert.alert('Success', 'Backup exported successfully!');
      haptics.notificationSuccess();
    }
  }, []);

  const handleImport = useCallback(async () => {
    const success = await importDataFromFile();
    if (success) {
      Alert.alert('Success', 'Data imported! Restart the app to see changes.');
      haptics.notificationSuccess();
    }
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all tasks, habits, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            clearAllStores();
            haptics.notificationWarning();
            Alert.alert('Done', 'All data has been cleared. Restart the app.');
          },
        },
      ],
    );
  }, []);

  const themeOptions: { key: ThemeMode; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: 'light-mode' },
    { key: 'dark', label: 'Dark', icon: 'dark-mode' },
    { key: 'system', label: 'System', icon: 'settings-brightness' },
  ];

  return (
    <Screen>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text
          style={[
            typography.h1,
            { color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing['2xl'] },
          ]}
        >
          Settings
        </Text>
      </Animated.View>

      {/* Theme */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Section title="Appearance">
          <View style={styles.themeRow}>
            {themeOptions.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => handleThemeChange(opt.key)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor:
                      themeMode === opt.key && !premiumThemeId
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      themeMode === opt.key && !premiumThemeId
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Icon
                  name={opt.icon}
                  size={24}
                  color={
                    themeMode === opt.key && !premiumThemeId
                      ? colors.textOnPrimary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    typography.label,
                    {
                      color:
                        themeMode === opt.key && !premiumThemeId
                          ? colors.textOnPrimary
                          : colors.textSecondary,
                      marginTop: 6,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      </Animated.View>

      {/* Premium Themes */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <Section title="Premium Themes">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm, marginLeft: -spacing.md, marginRight: -spacing.md }}>
            {premiumThemes.map(pt => {
              const isUnlocked = unlockedThemeIds.includes(pt.id);
              const isActive = premiumThemeId === pt.id;
              return (
                <Pressable
                  key={pt.id}
                  onPress={() => {
                    if (isUnlocked) {
                      handlePremiumThemeSelect(pt.id);
                    } else {
                      handleUnlockTheme(pt.id, pt.name);
                    }
                  }}
                  style={[
                    styles.premiumThemeCard,
                    {
                      backgroundColor: pt.colors.surface,
                      borderColor: isActive ? pt.colors.primary : pt.colors.border,
                      borderWidth: isActive ? 2 : 1,
                      opacity: isUnlocked ? 1 : 0.7,
                    }
                  ]}
                >
                  <View style={[styles.premiumThemeColorBubble, { backgroundColor: pt.colors.primary }]}>
                    {!isUnlocked && (
                      <Icon name="lock" size={16} color={pt.colors.surface} />
                    )}
                  </View>
                  <Text style={[typography.label, { color: pt.colors.textPrimary, marginTop: spacing.sm, textAlign: 'center' }]}>
                    {pt.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Section>
      </Animated.View>

      {/* Notifications */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Section title="Notifications">
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="notifications" size={22} color={colors.icon} />
                <Text
                  style={[
                    typography.body,
                    { color: colors.textPrimary, marginLeft: spacing.md },
                  ]}
                >
                  Enable Reminders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (val) => {
                  if (val) {
                    const granted = await requestPermissions();
                    if (!granted) {
                      Alert.alert(
                        'Permission Required',
                        'Please enable notifications for DailyDock in your device settings to use reminders.'
                      );
                      haptics.notificationError();
                      setNotificationsEnabled(false);
                      return;
                    }
                  }
                  setNotificationsEnabled(val);
                  haptics.selection();
                }}
                trackColor={{
                  false: colors.border,
                  true: colors.primaryLight,
                }}
                thumbColor={
                  notificationsEnabled ? colors.primary : colors.textTertiary
                }
              />
            </View>
          </Card>
        </Section>
      </Animated.View>

      {/* Data */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Section title="Data">
          <Card>
            <Pressable
              style={styles.settingRow}
              onPress={handleSaveToDevice}
            >
              <View style={styles.settingInfo}>
                <Icon name="save-alt" size={22} color={colors.icon} />
                <Text
                  style={[
                    typography.body,
                    { color: colors.textPrimary, marginLeft: spacing.md },
                  ]}
                >
                  Export Backup (JSON)
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={22}
                color={colors.textTertiary}
              />
            </Pressable>

            <Pressable
              style={styles.settingRow}
              onPress={handleImport}
            >
              <View style={styles.settingInfo}>
                <Icon name="file-download" size={22} color={colors.icon} />
                <Text
                  style={[
                    typography.body,
                    { color: colors.textPrimary, marginLeft: spacing.md },
                  ]}
                >
                  Import Data (File)
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={22}
                color={colors.textTertiary}
              />
            </Pressable>

            <Pressable
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={handleClearAll}
            >
              <View style={styles.settingInfo}>
                <Icon name="delete-forever" size={22} color={colors.error} />
                <Text
                  style={[
                    typography.body,
                    { color: colors.error, marginLeft: spacing.md },
                  ]}
                >
                  Clear All Data
                </Text>
              </View>
            </Pressable>
          </Card>
        </Section>
      </Animated.View>

      {/* About */}
      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <Section title="About">
          <Card>
            <View style={styles.aboutRow}>
              <Text
                style={[typography.body, { color: colors.textPrimary }]}
              >
                DailyDock
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.textTertiary },
                ]}
              >
                Version 1.0.0
              </Text>
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: colors.textTertiary,
                  marginTop: spacing.sm,
                  textAlign: 'center',
                },
              ]}
            >
              Simple, elegant productivity ⚓
            </Text>
          </Card>
        </Section>
      </Animated.View>

      {/* Banner Ad */}
      {shouldShowAds() && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={getBannerAdUnitId()}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  themeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },
  premiumThemeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    width: 100,
  },
  premiumThemeColorBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
