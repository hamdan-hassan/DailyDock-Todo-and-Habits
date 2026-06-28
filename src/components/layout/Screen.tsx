/**
 * DailyDock — Screen Layout Component
 *
 * SafeArea wrapper with consistent padding and scroll behavior.
 */

import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { screenPadding } from '../../theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  onRefresh?: () => void;
  refreshing?: boolean;
  noPadding?: boolean;
  bottomPadding?: number;
}

export function Screen({
  children,
  scrollable = true,
  style,
  contentStyle,
  edges = ['top', 'left', 'right'],
  onRefresh,
  refreshing = false,
  noPadding = false,
  bottomPadding = Platform.OS === 'ios' ? 96 : 80,
}: ScreenProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const paddingStyle: ViewStyle = noPadding
    ? {}
    : {
        paddingHorizontal: screenPadding.horizontal,
      };

  if (scrollable) {
    return (
      <SafeAreaView style={[containerStyle, style]} edges={edges}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding },
            paddingStyle,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[containerStyle, style]} edges={edges}>
      <View style={[styles.content, paddingStyle, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
