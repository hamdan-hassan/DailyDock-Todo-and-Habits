/**
 * DailyDock — Analytics Screen
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Screen } from '../../../components/layout/Screen';
import { Section } from '../../../components/layout/Section';
import { Card } from '../../../components/ui/Card';
import { ProgressCircle } from '../../../components/ui/ProgressCircle';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useTaskStore } from '../../tasks/store/taskStore';
import { useHabitStore } from '../../habits/store/habitStore';
import { getLastNDays } from '../../../utils/date';
import { shouldShowAds, getBannerAdUnitId } from '../../../services/ads';
import { format } from 'date-fns';

export function AnalyticsScreen() {
  const { colors, typography } = useTheme();

  const tasks = useTaskStore(s => s.tasks);
  const habits = useHabitStore(s => s.habits);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalHabitCompletions = habits.reduce(
    (acc, h) => acc + Object.values(h.completions).filter(Boolean).length,
    0,
  );

  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.bestStreak),
    0,
  );

  const currentStreak = habits.reduce(
    (max, h) => Math.max(max, h.currentStreak),
    0,
  );

  // Chart data — last 7 days task completions
  const chartData = useMemo(() => {
    const last7 = getLastNDays(7);
    return last7.map(date => {
      const count = tasks.filter(
        t =>
          t.status === 'completed' &&
          t.completedAt &&
          t.completedAt.startsWith(date),
      ).length;

      return {
        value: count,
        label: format(new Date(date), 'EEE'),
        frontColor: count > 0 ? colors.primary : colors.primaryLight,
        topLabelComponent: () =>
          count > 0 ? (
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginBottom: 4 },
              ]}
            >
              {count}
            </Text>
          ) : null,
      };
    });
  }, [tasks, colors, typography]);

  const chartMaxValue = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.value));
    // Add 25% headroom so the top labels don't get clipped at the top of the chart
    return Math.ceil(Math.max(max, 4) * 1.25);
  }, [chartData]);

  return (
    <Screen>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text
          style={[
            typography.h1,
            { color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing['2xl'] },
          ]}
        >
          Analytics
        </Text>
      </Animated.View>

      {/* Completion Rate */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Section title="Overall Completion">
          <Card>
            <View style={styles.completionRow}>
              <ProgressCircle
                progress={completionRate}
                size={100}
                strokeWidth={8}
                color={colors.success}
              />
              <View style={styles.completionStats}>
                <View style={styles.statItem}>
                  <Text style={[typography.stat, { color: colors.primary }]}>
                    {completedTasks}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Tasks Completed
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[typography.stat, { color: colors.success }]}>
                    {totalHabitCompletions}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Habit Check-ins
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Section>
      </Animated.View>

      {/* Streak */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Section title="Streaks">
          <View style={styles.streakRow}>
            <Card style={styles.streakCard}>
              <Text style={[typography.stat, { color: colors.streakFire }]}>
                🔥 {currentStreak}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Current Streak
              </Text>
            </Card>
            <Card style={styles.streakCard}>
              <Text style={[typography.stat, { color: colors.warning }]}>
                ⭐ {bestStreak}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
            </Card>
          </View>
        </Section>
      </Animated.View>

      {/* Weekly Chart */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Section title="This Week">
          <Card>
            <BarChart
              key={chartData.map(d => d.value).join('-')}
              data={chartData}
              maxValue={chartMaxValue}
              barWidth={28}
              spacing={16}
              roundedTop
              roundedBottom
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={0}
              xAxisLabelTextStyle={[
                typography.caption,
                { color: colors.textTertiary },
              ]}
              yAxisTextStyle={[
                typography.caption,
                { color: colors.textTertiary },
              ]}
              hideRules
              barBorderRadius={6}
              isAnimated
              animationDuration={600}
              backgroundColor="transparent"
              height={150}
            />
          </Card>
        </Section>
      </Animated.View>

      {/* Habit Progress */}
      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <Section title="Habit Progress">
          {habits.map(habit => {
            const totalDays = Object.values(habit.completions).filter(Boolean).length;
            const targetDays = habit.frequency === 'daily' ? 30 : 4;
            const progress = Math.min(100, (totalDays / targetDays) * 100);

            return (
              <View key={habit.id} style={styles.habitProgress}>
                <View style={styles.habitProgressHeader}>
                  <Text
                    style={[typography.bodySmall, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                  <Text
                    style={[typography.caption, { color: colors.textTertiary }]}
                  >
                    {totalDays} days
                  </Text>
                </View>
                <ProgressBar
                  progress={progress}
                  color={habit.color}
                  backgroundColor={`${habit.color}20`}
                  height={6}
                />
              </View>
            );
          })}
          {habits.length === 0 && (
            <Text
              style={[
                typography.bodySmall,
                { color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl },
              ]}
            >
              Create habits to see progress here
            </Text>
          )}
        </Section>
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
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xl'],
  },
  completionStats: {
    flex: 1,
    gap: spacing.lg,
  },
  statItem: {},
  streakRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  habitProgress: {
    marginBottom: spacing.lg,
  },
  habitProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  adContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },
});
