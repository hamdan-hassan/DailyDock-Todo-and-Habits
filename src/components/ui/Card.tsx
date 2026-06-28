/**
 * DailyDock — Card Component
 *
 * Premium card with shadow, rounded corners, and press animation.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { springConfigs } from '../../theme/animations';
import { haptics } from '../../services/haptics';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevated?: boolean;
  noPadding?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  onPress,
  style,
  padding,
  elevated = true,
  noPadding = false,
}: CardProps) {
  const { colors, shadows: themeShadows } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, springConfigs.snappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, springConfigs.snappy);
    }
  };

  const handlePress = () => {
    if (onPress) {
      haptics.impactLight();
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: noPadding ? 0 : (padding ?? spacing.lg),
    ...(elevated ? themeShadows.md : {}),
    borderWidth: elevated ? 0 : 1,
    borderColor: colors.border,
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animatedStyle, style]}
        accessibilityRole="button"
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({});
