/**
 * DailyDock — Search Screen
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useTaskStore } from '../../tasks/store/taskStore';
import { useHabitStore } from '../../habits/store/habitStore';
import { useDebounce } from '../../../hooks/useDebounce';
import { getCategoryConfig } from '../../../constants/categories';
import { formatDate } from '../../../utils/date';
import type { HomeStackParamList } from '../../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

type ResultItem =
  | { type: 'task'; id: string; title: string; subtitle: string; category: string }
  | { type: 'habit'; id: string; title: string; subtitle: string; color: string };

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, typography } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'tasks' | 'habits'>('all');

  const debouncedQuery = useDebounce(query, 300);
  const searchTasks = useTaskStore(s => s.searchTasks);
  const searchHabits = useHabitStore(s => s.searchHabits);

  const results = useMemo<ResultItem[]>(() => {
    if (!debouncedQuery.trim()) return [];

    const items: ResultItem[] = [];

    if (filter !== 'habits') {
      const tasks = searchTasks(debouncedQuery);
      tasks.forEach(t => {
        const cat = getCategoryConfig(t.category);
        items.push({
          type: 'task',
          id: t.id,
          title: t.title,
          subtitle: `${cat.label}${t.dueDate ? ` · ${formatDate(t.dueDate)}` : ''}`,
          category: t.category,
        });
      });
    }

    if (filter !== 'tasks') {
      const habits = searchHabits(debouncedQuery);
      habits.forEach(h => {
        items.push({
          type: 'habit',
          id: h.id,
          title: h.name,
          subtitle: `${h.frequency} · 🔥 ${h.currentStreak}`,
          color: h.color,
        });
      });
    }

    return items;
  }, [debouncedQuery, filter, searchTasks, searchHabits]);

  const renderItem = useCallback(
    ({ item }: { item: ResultItem }) => (
      <Animated.View entering={FadeInDown.duration(200)}>
        <Card
          onPress={() => {
            if (item.type === 'task') {
              navigation.navigate('TaskForm', { taskId: item.id });
            } else {
              navigation.navigate('HabitForm', { habitId: item.id });
            }
          }}
          style={styles.resultCard}
        >
          <View style={styles.resultRow}>
            <View
              style={[
                styles.resultIcon,
                {
                  backgroundColor:
                    item.type === 'task'
                      ? colors.primaryLight
                      : `${(item as any).color}20`,
                },
              ]}
            >
              <Icon
                name={item.type === 'task' ? 'check-circle' : 'loop'}
                size={20}
                color={
                  item.type === 'task'
                    ? colors.primary
                    : (item as any).color
                }
              />
            </View>
            <View style={styles.resultText}>
              <Text
                style={[typography.h4, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textTertiary },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
            <Badge
              label={item.type === 'task' ? 'Task' : 'Habit'}
              size="sm"
            />
          </View>
        </Card>
      </Animated.View>
    ),
    [colors, typography, navigation],
  );

  return (
    <Screen scrollable={false}>
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Icon name="search" size={20} color={colors.iconSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks & habits..."
            placeholderTextColor={colors.placeholder}
            style={[
              typography.body,
              styles.searchInput,
              { color: colors.textPrimary },
            ]}
            autoFocus
            cursorColor={colors.primary}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="close" size={18} color={colors.iconSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {(['all', 'tasks', 'habits'] as const).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f ? colors.primary : colors.surface,
                borderColor:
                  filter === f ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                {
                  color:
                    filter === f
                      ? colors.textOnPrimary
                      : colors.textSecondary,
                },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          debouncedQuery.trim() ? (
            <EmptyState
              icon="search-off"
              title="No results found"
              subtitle={`Nothing matches "${debouncedQuery}"`}
            />
          ) : (
            <EmptyState
              icon="search"
              title="Search"
              subtitle="Find your tasks and habits"
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    height: 44,
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
  listContent: {
    paddingBottom: 100,
  },
  resultCard: {
    marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
