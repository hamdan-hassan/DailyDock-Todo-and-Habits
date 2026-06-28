/**
 * DailyDock — Haptic Feedback Service
 *
 * Wraps react-native-haptic-feedback with safe fallbacks.
 */

import { Platform } from 'react-native';
import ReactNativeHapticFeedback, {
  type HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/** Light impact — button presses, selections */
export function impactLight(): void {
  try {
    ReactNativeHapticFeedback.trigger('impactLight', options);
  } catch {
    // Silently fail on unsupported devices
  }
}

/** Medium impact — confirming actions */
export function impactMedium(): void {
  try {
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  } catch {}
}

/** Heavy impact — destructive actions */
export function impactHeavy(): void {
  try {
    ReactNativeHapticFeedback.trigger('impactHeavy', options);
  } catch {}
}

/** Selection feedback — toggling switches, picking options */
export function selection(): void {
  try {
    ReactNativeHapticFeedback.trigger('selection', options);
  } catch {}
}

/** Success notification — completing tasks */
export function notificationSuccess(): void {
  try {
    ReactNativeHapticFeedback.trigger('notificationSuccess', options);
  } catch {}
}

/** Warning notification — important alerts */
export function notificationWarning(): void {
  try {
    ReactNativeHapticFeedback.trigger('notificationWarning', options);
  } catch {}
}

/** Error notification — destructive confirmations */
export function notificationError(): void {
  try {
    ReactNativeHapticFeedback.trigger('notificationError', options);
  } catch {}
}

/** Generic trigger with any haptic type */
export function trigger(type: HapticFeedbackTypes): void {
  try {
    ReactNativeHapticFeedback.trigger(type, options);
  } catch {}
}

export const haptics = {
  impactLight,
  impactMedium,
  impactHeavy,
  selection,
  notificationSuccess,
  notificationWarning,
  notificationError,
  trigger,
};
