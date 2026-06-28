/**
 * DailyDock — Checkbox Component
 *
 * Animated circular checkbox with checkmark drawing animation.
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme';
import { springConfigs } from '../../theme/animations';
import { haptics } from '../../services/haptics';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onToggle,
  size = 24,
  color,
  disabled = false,
}: CheckboxProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);
  const checkColor = color ?? colors.primary;

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, springConfigs.snappy);
  }, [checked, progress]);

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSpring(0.85, springConfigs.bouncy);
    setTimeout(() => {
      scale.value = withSpring(1, springConfigs.bouncy);
    }, 100);
    if (!checked) {
      haptics.notificationSuccess();
    } else {
      haptics.selection();
    }
    onToggle();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: checked ? checkColor : colors.border,
    backgroundColor: checked ? checkColor : 'transparent',
    borderWidth: checked ? 0 : 2,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2 },
          containerStyle,
        ]}
      >
        <Animated.View style={checkmarkStyle}>
          <Svg
            width={size * 0.55}
            height={size * 0.55}
            viewBox="0 0 24 24"
          >
            <Path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
              fill="white"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
