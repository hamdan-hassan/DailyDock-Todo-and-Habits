/**
 * DailyDock — AnimatedPressable Component
 *
 * Premium pressable with scale animation and haptic feedback.
 */

import React, { useCallback } from 'react';
import {
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { springConfigs, pressScale } from '../../theme/animations';
import { haptics } from '../../services/haptics';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  hapticType?: 'light' | 'medium' | 'selection' | 'none';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  style,
  scaleValue = pressScale.light,
  hapticType = 'light',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(scaleValue, springConfigs.snappy);
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, springConfigs.snappy);
    })
    .onEnd(() => {
      if (onPress) {
        // Run on JS thread
        onPress();
      }
      if (hapticType !== 'none') {
        switch (hapticType) {
          case 'light':
            haptics.impactLight();
            break;
          case 'medium':
            haptics.impactMedium();
            break;
          case 'selection':
            haptics.selection();
            break;
        }
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(500)
    .onStart(() => {
      if (onLongPress) {
        onLongPress();
        haptics.impactMedium();
      }
    });

  const composed = onLongPress
    ? Gesture.Race(tapGesture, longPressGesture)
    : tapGesture;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[animatedStyle, style]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
