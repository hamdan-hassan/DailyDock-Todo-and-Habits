/**
 * DailyDock — ProgressBar Component
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { timingConfigs } from '../../theme/animations';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  showLabel = false,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const animatedWidth = useSharedValue(0);

  const barColor = color ?? colors.primary;
  const bgColor = backgroundColor ?? colors.primaryLight;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, timingConfigs.emphasis);
  }, [clampedProgress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={style}>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: colors.textSecondary },
          ]}
        >
          {Math.round(clampedProgress)}%
        </Text>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor: bgColor,
            height,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              height,
              borderRadius: height / 2,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 4,
  },
});
