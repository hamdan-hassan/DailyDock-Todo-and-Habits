/**
 * DailyDock — Task Form Screen
 */

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Switch } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { useTaskStore } from '../store/taskStore';
import { taskSchema, type TaskFormData } from '../schemas/taskSchema';
import { CATEGORIES } from '../../../constants/categories';
import { PRIORITIES } from '../../../constants/priorities';
import { formatDate, formatTime } from '../../../utils/date';
import { haptics } from '../../../services/haptics';
import { format } from 'date-fns';
import { requestPermissions } from '../../../services/notifications';
import type { HomeStackParamList, TaskCategory, TaskPriority } from '../../../types';

type RouteParams = RouteProp<HomeStackParamList, 'TaskForm'>;

export function TaskFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { colors, typography } = useTheme();

  const taskId = route.params?.taskId;
  const existingTask = useTaskStore(s => s.getTaskById(taskId ?? ''));
  const addTask = useTaskStore(s => s.addTask);
  const updateTask = useTaskStore(s => s.updateTask);
  const deleteTask = useTaskStore(s => s.deleteTask);

  const isEditing = !!existingTask;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: existingTask?.title ?? '',
      description: existingTask?.description ?? '',
      dueDate: existingTask?.dueDate ?? null,
      dueTime: existingTask?.dueTime ?? null,
      priority: existingTask?.priority ?? 'medium',
      category: existingTask?.category ?? 'personal',
      reminderEnabled: existingTask?.reminderEnabled ?? false,
      reminderOffset: existingTask?.reminderOffset ?? 60,
    },
  });

  const selectedCategory = watch('category');
  const selectedPriority = watch('priority');
  const dueDate = watch('dueDate');
  const dueTime = watch('dueTime');
  const reminderEnabled = watch('reminderEnabled');
  const reminderOffset = watch('reminderOffset');

  const REMINDER_OPTIONS = [
    { label: 'At event time', value: 0 },
    { label: '15 mins before', value: 15 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
  ];

  const onSubmit = useCallback(
    (data: TaskFormData) => {
      if (isEditing && taskId) {
        updateTask({ id: taskId, ...data });
      } else {
        addTask(data);
      }
      haptics.notificationSuccess();
      navigation.goBack();
    },
    [isEditing, taskId, addTask, updateTask, navigation],
  );

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (taskId) {
            deleteTask(taskId);
            haptics.notificationWarning();
            navigation.goBack();
          }
        },
      },
    ]);
  }, [taskId, deleteTask, navigation]);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Task title"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
            icon="edit"
          />
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Description (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.description?.message}
            icon="notes"
            multiline
            numberOfLines={3}
          />
        )}
      />

      {/* Due Date */}
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        Due Date
      </Text>
      <View style={styles.dateRow}>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[styles.datePicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Icon name="event" size={20} color={colors.icon} />
          <Text style={[typography.body, { color: dueDate ? colors.textPrimary : colors.placeholder, marginLeft: 8 }]}>
            {dueDate ? formatDate(dueDate) : 'Select date'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={[styles.datePicker, { backgroundColor: colors.surface, borderColor: colors.border, flex: 0.6 }]}
        >
          <Icon name="schedule" size={20} color={colors.icon} />
          <Text style={[typography.body, { color: dueTime ? colors.textPrimary : colors.placeholder, marginLeft: 8 }]}>
            {dueTime ? formatTime(dueTime) : 'Time'}
          </Text>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate ? new Date(dueDate) : new Date()}
          mode="date"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) {
              setValue('dueDate', format(date, 'yyyy-MM-dd'));
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (date) {
              setValue('dueTime', format(date, 'HH:mm'));
            }
          }}
        />
      )}

      {/* Priority */}
      <Text style={[typography.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        Priority
      </Text>
      <View style={styles.optionRow}>
        {PRIORITIES.map(p => (
          <Pressable
            key={p.key}
            onPress={() => {
              setValue('priority', p.key as TaskPriority);
              haptics.selection();
            }}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  selectedPriority === p.key
                    ? (colors[p.colorKey as keyof typeof colors] as string)
                    : colors.surface,
                borderColor:
                  selectedPriority === p.key
                    ? (colors[p.colorKey as keyof typeof colors] as string)
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                {
                  color:
                    selectedPriority === p.key
                      ? colors.textOnPrimary
                      : colors.textSecondary,
                },
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Category */}
      <Text style={[typography.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        Category
      </Text>
      <View style={styles.optionRow}>
        {CATEGORIES.map(c => (
          <Pressable
            key={c.key}
            onPress={() => {
              setValue('category', c.key as TaskCategory);
              haptics.selection();
            }}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  selectedCategory === c.key
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  selectedCategory === c.key
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <Icon
              name={c.icon}
              size={14}
              color={
                selectedCategory === c.key
                  ? colors.textOnPrimary
                  : colors.textSecondary
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.label,
                {
                  color:
                    selectedCategory === c.key
                      ? colors.textOnPrimary
                      : colors.textSecondary,
                },
              ]}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Reminder settings */}
      {dueDate && (
        <>
          <View style={styles.reminderHeader}>
            <Text style={[typography.label, { color: colors.textSecondary }]}>
              Task Reminder
            </Text>
            <Switch
              value={reminderEnabled}
              onValueChange={async (val) => {
                if (val) {
                  const granted = await requestPermissions();
                  if (!granted) {
                    Alert.alert('Permission Required', 'Please enable notifications in your device settings to use reminders.');
                    return;
                  }
                }
                setValue('reminderEnabled', val);
                if (val && reminderOffset === null) {
                  setValue('reminderOffset', 60); // default to 1 hr
                }
                haptics.selection();
              }}
              trackColor={{
                false: colors.border,
                true: colors.primaryLight,
              }}
              thumbColor={
                reminderEnabled ? colors.primary : colors.textTertiary
              }
            />
          </View>
          
          {reminderEnabled && (
            <View style={[styles.optionRow, { marginTop: spacing.sm }]}>
              {REMINDER_OPTIONS.map(opt => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setValue('reminderOffset', opt.value);
                    haptics.selection();
                  }}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor:
                        reminderOffset === opt.value
                          ? colors.primary
                          : colors.surface,
                      borderColor:
                        reminderOffset === opt.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.label,
                      {
                        color:
                          reminderOffset === opt.value
                            ? colors.textOnPrimary
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={isEditing ? 'Save Changes' : 'Create Task'}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          fullWidth
          size="lg"
          icon={isEditing ? 'check' : 'add'}
        />
        {isEditing && (
          <Button
            title="Delete Task"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            size="md"
            icon="delete"
            style={{ marginTop: spacing.md }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  datePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    minHeight: 48,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  actions: {
    marginTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
});
