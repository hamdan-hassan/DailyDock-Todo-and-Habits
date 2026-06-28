/**
 * DailyDock — Ad Configuration
 *
 * Replace with your own Ad Unit IDs before production release.
 * These are Google's official test ad unit IDs for development.
 */

import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/** Replace these with your actual AdMob IDs from your Google AdMob dashboard */
const REAL_AD_UNIT_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-4478899815710413/5518702941',
    ios: 'ca-app-pub-4478899815710413/5518702941',
    default: '',
  })!,
  native: Platform.select({
    android: 'ca-app-pub-4478899815710413/5518702941',
    ios: 'ca-app-pub-4478899815710413/5518702941',
    default: '',
  })!,
  rewarded: Platform.select({
    android: 'ca-app-pub-4478899815710413/7496175194', // Replace with your actual rewarded ad unit ID
    ios: 'ca-app-pub-4478899815710413/7496175194',     // Replace with your actual rewarded ad unit ID
    default: '',
  })!,
};

/** Automatically switch between Test Ads in DEV and Real Ads in PROD */
export const AD_UNIT_IDS = {
  banner: __DEV__ ? TestIds.BANNER : REAL_AD_UNIT_IDS.banner,
  native: __DEV__ ? TestIds.NATIVE : REAL_AD_UNIT_IDS.native,
  rewarded: __DEV__ ? TestIds.REWARDED : REAL_AD_UNIT_IDS.rewarded,
};


