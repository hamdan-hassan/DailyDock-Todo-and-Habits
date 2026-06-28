/**
 * DailyDock — Habit List Screen
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ProgressCircle } from '../../../components/ui/ProgressCircle';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useHabitStore } from '../store/habitStore';
import { getTodayDate, getCurrentWeekDays } from '../../../utils/date';
import { haptics } from '../../../services/haptics';
import type { HabitsStackParamList, Habit } from '../../../types';
import { format } from 'date-fns';

type Nav = NativeStackNavigationProp<HabitsStackParamList>;

export function HabitListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, typography, shadows: themeShadows } = useTheme();

  const habits = useHabitStore(s => s.habits);
  const toggleCompletion = useHabitStore(s => s.toggleCompletion);

  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const today = getTodayDate();

  const [page, setPage] = React.useState(1);
  const ITEMS_PER_PAGE = 20;

  const paginatedHabits = useMemo(() => {
    return habits.slice(0, page * ITEMS_PER_PAGE);
  }, [habits, page]);

  const handleEndReached = useCallback(() => {
    if (page * ITEMS_PER_PAGE < habits.length) {
      setPage(prev => prev + 1);
    }
  }, [page, habits.length]);

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => {
      const completedToday = item.completions[today] === true;
      const totalCompleted = Object.values(item.completions).filter(Boolean).length;

      return (
        <Animated.View
          entering={FadeInDown.duration(250)}
          layout={LinearTransition.springify()}
        >
          <Card
            onPress={() =>
              navigation.navigate('HabitForm', { habitId: item.id })
            }
            style={styles.habitCard}
          >
            <View style={styles.habitHeader}>
              <View style={styles.habitInfo}>
                <View
                  style={[
                    styles.habitIcon,
                    { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <Icon
                    name={item.icon || 'star'}
                    size={22}
                    color={item.color}
                  />
                </View>
                <View style={styles.habitText}>
                  <Text
                    style={[typography.h4, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {item.frequency === 'daily' ? 'Every day' : 'Weekly'} ·{' '}
                    {totalCompleted} total
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  toggleCompletion(item.id);
                  if (!completedToday) {
                    haptics.notificationSuccess();
                  } else {
                    haptics.selection();
                  }
                }}
              >
                <ProgressCircle
                  progress={completedToday ? 100 : 0}
                  size={50}
                  strokeWidth={4}
                  color={item.color}
                  showLabel={false}
                >
                  <Icon
                    name={completedToday ? 'check' : 'radio-button-unchecked'}
                    size={20}
                    color={completedToday ? item.color : colors.textTertiary}
                  />
                </ProgressCircle>
              </Pressable>
            </View>

            {/* Weekly dots */}
            <View style={styles.weekRow}>
              {weekDays.map(day => {
                const isCompleted = item.completions[day] === true;
                const isToday = day === today;
                const dayLabel = format(new Date(day), 'EEEEE');

                return (
                  <View key={day} style={styles.dayColumn}>
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: isToday
                            ? colors.primary
                            : colors.textTertiary,
                          fontWeight: isToday ? '700' : '400',
                        },
                      ]}
                    >
                      {dayLabel}
                    </Text>
                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: isCompleted
                            ? item.color
                            : colors.border,
                          borderWidth: isToday ? 2 : 0,
                          borderColor: isToday
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {/* Streak */}
            {item.currentStreak > 0 && (
              <View
                style={[
                  styles.streakBadge,
                  { backgroundColor: colors.streakGlow },
                ]}
              >
                <Text
                  style={[
                    typography.label,
                    { color: colors.streakFire },
                  ]}
                >
                  🔥 {item.currentStreak} day streak
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>
      );
    },
    [colors, typography, today, weekDays, navigation, toggleCompletion],
  );

  return (
    <Screen scrollable={false} noPadding>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>
          Habits
        </Text>
        <Pressable
          onPress={() => navigation.navigate('HabitForm')}
          style={[
            styles.addButton,
            { backgroundColor: colors.primary, ...themeShadows.md },
          ]}
        >
          <Icon name="add" size={24} color={colors.textOnPrimary} />
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        <FlashList
          data={paginatedHabits}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: Platform.OS === 'ios' ? 96 : 80,
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}

          ListEmptyComponent={
            <EmptyState
              icon="loop"
              title="No habits yet"
              subtitle="Build consistency with daily habits"
              actionLabel="Add Habit"
              onAction={() => navigation.navigate('HabitForm')}
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  habitCard: {
    marginBottom: spacing.md,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginTop: spacing.md,
  },
});
