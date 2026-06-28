/**
 * DailyDock — ProgressCircle Component
 *
 * SVG-based circular progress indicator for habits.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { timingConfigs } from '../../theme/animations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelText?: string;
  children?: React.ReactNode;
}

export function ProgressCircle({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  backgroundColor,
  showLabel = true,
  labelText,
  children,
}: ProgressCircleProps) {
  const { colors, typography } = useTheme();
  const animatedProgress = useSharedValue(0);

  const ringColor = color ?? colors.primary;
  const bgColor = backgroundColor ?? colors.primaryLight;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      ...timingConfigs.emphasis,
      duration: 800,
    });
  }, [clampedProgress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      circumference - (animatedProgress.value / 100) * circumference,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {children ?? (
          showLabel && (
            <Text
              style={[
                typography.label,
                { color: colors.textPrimary },
              ]}
            >
              {labelText ?? `${Math.round(clampedProgress)}%`}
            </Text>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
