/**
 * DailyDock — Task List Screen
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useTaskStore } from '../store/taskStore';
import { formatDate, formatTime, isOverdue } from '../../../utils/date';
import { getCategoryConfig } from '../../../constants/categories';
import { getPriorityConfig } from '../../../constants/priorities';
import type { TasksStackParamList, TaskCategory, Task } from '../../../types';

type Nav = NativeStackNavigationProp<TasksStackParamList>;
type FilterType = 'all' | 'active' | 'completed';

export function TaskListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, typography, shadows: themeShadows } = useTheme();
  const [filter, setFilter] = useState<FilterType>('active');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | null>(null);

  const tasks = useTaskStore(s => s.tasks);
  const toggleComplete = useTaskStore(s => s.toggleComplete);
  const deleteTask = useTaskStore(s => s.deleteTask);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Status filter
    if (filter === 'active') {
      result = result.filter(t => t.status === 'active');
    } else if (filter === 'completed') {
      result = result.filter(t => t.status === 'completed');
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Sort: overdue first, then by due date, then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return result.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const aOverdue = isOverdue(a.dueDate);
      const bOverdue = isOverdue(b.dueDate);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, filter, categoryFilter]);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredTasks, page]);

  const handleEndReached = useCallback(() => {
    if (page * ITEMS_PER_PAGE < filteredTasks.length) {
      setPage(prev => prev + 1);
    }
  }, [page, filteredTasks.length]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filter, categoryFilter]);

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Done' },
  ];

  const renderItem = useCallback(
    ({ item }: { item: Task }) => {
      const category = getCategoryConfig(item.category);
      const priority = getPriorityConfig(item.priority);
      const overdue = isOverdue(item.dueDate);

      return (
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutUp.duration(200)}
          layout={LinearTransition.springify()}
        >
          <Card
            onPress={() =>
              navigation.navigate('TaskForm', { taskId: item.id })
            }
            style={styles.taskCard}
          >
            <View style={styles.taskRow}>
              <Checkbox
                checked={item.status === 'completed'}
                onToggle={() => toggleComplete(item.id)}
                color={
                  colors[
                    priority.colorKey as keyof typeof colors
                  ] as string
                }
              />
              <View style={styles.taskContent}>
                <Text
                  style={[
                    typography.h4,
                    {
                      color:
                        item.status === 'completed'
                          ? colors.textTertiary
                          : colors.textPrimary,
                      textDecorationLine:
                        item.status === 'completed'
                          ? 'line-through'
                          : 'none',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View style={styles.taskMeta}>
                  <Badge
                    label={category.label}
                    color={
                      colors[
                        category.colorKey as keyof typeof colors
                      ] as string
                    }
                    backgroundColor={`${
                      colors[
                        category.colorKey as keyof typeof colors
                      ] as string
                    }20`}
                    size="sm"
                  />
                  {item.dueDate && (
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: overdue
                            ? colors.error
                            : colors.textTertiary,
                          marginLeft: 8,
                        },
                      ]}
                    >
                      {formatDate(item.dueDate)}
                      {item.dueTime ? ` · ${formatTime(item.dueTime)}` : ''}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.priorityDot,
                  {
                    backgroundColor: colors[
                      priority.colorKey as keyof typeof colors
                    ] as string,
                  },
                ]}
              />
            </View>
          </Card>
        </Animated.View>
      );
    },
    [colors, typography, navigation, toggleComplete],
  );

  return (
    <Screen scrollable={false} noPadding>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>
          Tasks
        </Text>
        <Pressable
          onPress={() => navigation.navigate('TaskForm')}
          style={[
            styles.addButton,
            { backgroundColor: colors.primary, ...themeShadows.md },
          ]}
        >
          <Icon name="add" size={24} color={colors.textOnPrimary} />
        </Pressable>
      </View>

      {/* Filters */}
      <View style={[styles.filters, { paddingHorizontal: spacing.xl }]}>
        {filterButtons.map(fb => (
          <Pressable
            key={fb.key}
            onPress={() => setFilter(fb.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === fb.key ? colors.primary : colors.surface,
                borderColor:
                  filter === fb.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                {
                  color:
                    filter === fb.key
                      ? colors.textOnPrimary
                      : colors.textSecondary,
                },
              ]}
            >
              {fb.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Task List */}
      <View style={styles.listContainer}>
        <FlashList
          data={paginatedTasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: Platform.OS === 'ios' ? 96 : 80 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState
              icon="check-circle"
              title="No tasks yet"
              subtitle="Tap + to create your first task"
              actionLabel="Add Task"
              onAction={() => navigation.navigate('TaskForm')}
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
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  listContainer: {
    flex: 1,
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
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
});
