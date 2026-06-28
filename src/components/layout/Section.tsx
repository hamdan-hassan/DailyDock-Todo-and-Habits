/**
 * DailyDock — Section Layout Component
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  action?: React.ReactNode;
}

export function Section({
  children,
  title,
  subtitle,
  style,
  action,
}: SectionProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {(title || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && (
              <Text
                style={[
                  typography.h3,
                  { color: colors.textPrimary },
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[
                  typography.caption,
                  { color: colors.textTertiary, marginTop: 2 },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
});
