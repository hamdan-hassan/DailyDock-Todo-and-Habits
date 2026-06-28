/**
 * DailyDock — Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  label,
  color,
  backgroundColor,
  size = 'sm',
  style,
}: BadgeProps) {
  const { colors, typography } = useTheme();

  const bgColor = backgroundColor ?? colors.primaryLight;
  const textColor = color ?? colors.primary;
  const textStyle = size === 'sm' ? typography.caption : typography.label;
  const padding =
    size === 'sm'
      ? { paddingHorizontal: spacing.sm, paddingVertical: 2 }
      : { paddingHorizontal: spacing.md, paddingVertical: spacing.xs };

  return (
    <View style={[styles.container, { backgroundColor: bgColor, ...padding }, style]}>
      <Text style={[textStyle, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
});
