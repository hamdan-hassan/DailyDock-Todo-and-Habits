/**
 * DailyDock — Home Screen (Dashboard)
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Section } from '../../../components/layout/Section';
import { Card } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { ProgressCircle } from '../../../components/ui/ProgressCircle';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useTaskStore } from '../../tasks/store/taskStore';
import { useHabitStore } from '../../habits/store/habitStore';
import { getTodayDate } from '../../../utils/date';
import { shouldShowAds, getBannerAdUnitId } from '../../../services/ads';
import { getCategoryConfig } from '../../../constants/categories';
import { haptics } from '../../../services/haptics';
import type { HomeStackParamList } from '../../../types';
import { format } from 'date-fns';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, typography, shadows: themeShadows } = useTheme();

  const tasks = useTaskStore(s => s.tasks);
  const toggleComplete = useTaskStore(s => s.toggleComplete);
  const habits = useHabitStore(s => s.habits);
  const toggleHabitCompletion = useHabitStore(s => s.toggleCompletion);
  const isCompletedToday = useHabitStore(s => s.isCompletedToday);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter(
          t =>
            t.status === 'active' &&
            (t.dueDate === getTodayDate() || !t.dueDate),
        )
        .slice(0, 5),
    [tasks],
  );

  const completedToday = useMemo(
    () =>
      tasks.filter(
        t =>
          t.status === 'completed' &&
          t.completedAt?.startsWith(getTodayDate()),
      ).length,
    [tasks],
  );

  const totalActive = tasks.filter(t => t.status === 'active').length;

  const handleSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  return (
    <Screen>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <View>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>
            Dashboard
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
            {format(new Date(), 'EEEE, MMMM d')}
          </Text>
        </View>
        <Pressable
          onPress={handleSearch}
          style={[
            styles.searchButton,
            { backgroundColor: colors.surface, ...themeShadows.sm },
          ]}
          hitSlop={8}
        >
          <Icon name="search" size={22} color={colors.icon} />
        </Pressable>
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[typography.stat, { color: colors.primary }]}>
              {completedToday}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Done Today
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[typography.stat, { color: colors.warning }]}>
              {totalActive}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Active Tasks
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[typography.stat, { color: colors.success }]}>
              {habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Best Streak
            </Text>
          </Card>
        </View>
      </Animated.View>

      {/* Today's Tasks */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Section
          title="Today's Tasks"
          action={
            <Pressable
              onPress={() => navigation.navigate('TaskForm')}
              hitSlop={8}
            >
              <Icon name="add-circle" size={24} color={colors.primary} />
            </Pressable>
          }
        >
          {todayTasks.length === 0 ? (
            <Card>
              <EmptyState
                icon="check-circle"
                title="All clear!"
                subtitle="No tasks for today. Enjoy your day!"
                actionLabel="Add Task"
                onAction={() => navigation.navigate('TaskForm')}
              />
            </Card>
          ) : (
            todayTasks.map((task, index) => {
              const category = getCategoryConfig(task.category);
              return (
                <Card
                  key={task.id}
                  onPress={() =>
                    navigation.navigate('TaskForm', { taskId: task.id })
                  }
                  style={styles.taskCard}
                >
                  <View style={styles.taskRow}>
                    <Checkbox
                      checked={task.status === 'completed'}
                      onToggle={() => toggleComplete(task.id)}
                      color={colors[category.colorKey as keyof typeof colors] as string}
                    />
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          typography.h4,
                          {
                            color: colors.textPrimary,
                            textDecorationLine:
                              task.status === 'completed'
                                ? 'line-through'
                                : 'none',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Badge
                          label={category.label}
                          color={colors[category.colorKey as keyof typeof colors] as string}
                          backgroundColor={`${colors[category.colorKey as keyof typeof colors] as string}20`}
                          size="sm"
                        />
                        {task.dueTime && (
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.textTertiary, marginLeft: 8 },
                            ]}
                          >
                            {task.dueTime}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </Section>
      </Animated.View>

      {/* Habit Progress */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Section
          title="Habits"
          action={
            <Pressable
              onPress={() => navigation.navigate('HabitForm')}
              hitSlop={8}
            >
              <Icon name="add-circle" size={24} color={colors.primary} />
            </Pressable>
          }
        >
          {habits.length === 0 ? (
            <Card>
              <EmptyState
                icon="loop"
                title="Build great habits"
                subtitle="Start tracking your daily habits"
                actionLabel="Add Habit"
                onAction={() => navigation.navigate('HabitForm')}
              />
            </Card>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.habitsScroll}
            >
              {habits.map(habit => {
                const completed = isCompletedToday(habit.id);
                const totalDays = Object.values(habit.completions).filter(Boolean).length;
                const progress =
                  habit.frequency === 'daily'
                    ? completed
                      ? 100
                      : 0
                    : Math.min(100, (totalDays % 7) * (100 / 7));

                return (
                  <Card
                    key={habit.id}
                    onPress={() => {
                      toggleHabitCompletion(habit.id);
                      if (!completed) haptics.notificationSuccess();
                    }}
                    style={[styles.habitCard]}
                  >
                    <ProgressCircle
                      progress={progress}
                      size={64}
                      strokeWidth={5}
                      color={habit.color}
                    >
                      <Icon
                        name={habit.icon || 'star'}
                        size={22}
                        color={completed ? habit.color : colors.textTertiary}
                      />
                    </ProgressCircle>
                    <Text
                      style={[
                        typography.label,
                        { color: colors.textPrimary, marginTop: 8 },
                      ]}
                      numberOfLines={1}
                    >
                      {habit.name}
                    </Text>
                    {habit.currentStreak > 0 && (
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.streakFire, marginTop: 2 },
                        ]}
                      >
                        🔥 {habit.currentStreak}
                      </Text>
                    )}
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </Section>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate('HabitForm')}
            style={[
              styles.fabButton,
              { backgroundColor: colors.primary, ...themeShadows.lg },
            ]}
          >
            <Icon name="add" size={28} color={colors.textOnPrimary} />
            <Text
              style={[typography.button, { color: colors.textOnPrimary, marginLeft: 8 }]}
            >
              New Habit
            </Text>
          </Pressable>
        </View>
      </Animated.View>
      {/* Banner Ad */}
      {shouldShowAds() && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={getBannerAdUnitId()}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
    marginTop: spacing.lg,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  taskCard: {
    marginBottom: spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  habitsScroll: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  habitCard: {
    width: 120,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  quickActions: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.full,
  },
  adContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },
});
