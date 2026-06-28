/**
 * DailyDock — Ad Service
 *
 * Manages Google Mobile Ads initialization and premium status.
 */

import mobileAds, {
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../constants/ads';

/** Initialize AdMob SDK (call on app start) */
export async function initializeAds(): Promise<void> {
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    await mobileAds().initialize();
  } catch (error) {
    console.warn('[Ads] Failed to initialize:', error);
  }
}

/** Check if ads should be shown */
export function shouldShowAds(): boolean {
  return true;
}

/** Preload and show a rewarded ad */
export function showRewardedAd(onReward: () => void, onError?: () => void): void {
  const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
    requestNonPersonalizedAdsOnly: true,
  });

  const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewarded.show();
  });

  const unsubscribeEarned = rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    reward => {
      // Removed console.log for production
      onReward();
    },
  );

  const unsubscribeClosed = rewarded.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      // Clean up when ad is closed
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    }
  );

  rewarded.load();
}

/** Get banner ad unit ID */
export function getBannerAdUnitId(): string {
  return AD_UNIT_IDS.banner;
}

/** Get native ad unit ID */
export function getNativeAdUnitId(): string {
  return AD_UNIT_IDS.native;
}
