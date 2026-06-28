/**
 * DailyDock — Input Component
 *
 * Text input with floating label animation and error states.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { timingConfigs } from '../../theme/animations';
import { Icon } from './Icon';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  icon,
  style,
  containerStyle,
  value,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { colors, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(value ? 1 : 0);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      focusAnim.value = withTiming(1, timingConfigs.normal);
      onFocus?.(e);
    },
    [focusAnim, onFocus],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      if (!value) {
        focusAnim.value = withTiming(0, timingConfigs.normal);
      }
      onBlur?.(e);
    },
    [focusAnim, value, onBlur],
  );

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(focusAnim.value, [0, 1], [0, -24]),
      },
      {
        scale: interpolate(focusAnim.value, [0, 1], [1, 0.8]),
      },
    ],
    color: isFocused ? colors.primary : colors.textTertiary,
  }));

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.borderFocused
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: colors.surface,
          },
          style,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.iconSecondary}
            style={styles.icon}
          />
        )}
        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              typography.body,
              styles.label,
              labelAnimatedStyle,
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              typography.body,
              styles.input,
              { color: colors.textPrimary },
            ]}
            placeholderTextColor={colors.placeholder}
            cursorColor={colors.primary}
            selectionColor={colors.primaryLight}
            {...rest}
          />
        </View>
      </View>
      {error && (
        <Text
          style={[
            typography.caption,
            styles.errorText,
            { color: colors.error },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  icon: {
    marginRight: spacing.md,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 16,
  },
  input: {
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
});
