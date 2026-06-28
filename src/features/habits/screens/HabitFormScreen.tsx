/**
 * DailyDock — Habit Form Screen
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { requestPermissions } from '../../../services/notifications';
import { formatTime } from '../../../utils/date';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/layout/Screen';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { radii } from '../../../theme/radii';
import { palette } from '../../../theme/colors';
import { useHabitStore } from '../store/habitStore';
import { habitSchema, type HabitFormData } from '../schemas/habitSchema';
import { haptics } from '../../../services/haptics';
import type { HomeStackParamList, HabitFrequency } from '../../../types';

type RouteParams = RouteProp<HomeStackParamList, 'HabitForm'>;

const COLOR_OPTIONS = [
  palette.indigo500,
  palette.violet500,
  palette.emerald500,
  palette.amber500,
  palette.rose500,
  palette.sky500,
  palette.teal500,
  palette.orange500,
];

const ICON_OPTIONS = [
  'fitness-center',
  'self-improvement',
  'auto-stories',
  'water-drop',
  'restaurant',
  'code',
  'music-note',
  'brush',
  'directions-run',
  'bedtime',
  'local-drink',
  'eco',
];

export function HabitFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { colors, typography } = useTheme();

  const habitId = route.params?.habitId;
  const existingHabit = useHabitStore(s => s.getHabitById(habitId ?? ''));
  const addHabit = useHabitStore(s => s.addHabit);
  const updateHabit = useHabitStore(s => s.updateHabit);
  const deleteHabit = useHabitStore(s => s.deleteHabit);

  const isEditing = !!existingHabit;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema) as any,
    defaultValues: {
      name: existingHabit?.name ?? '',
      frequency: existingHabit?.frequency ?? 'daily',
      color: existingHabit?.color ?? COLOR_OPTIONS[0],
      icon: existingHabit?.icon ?? ICON_OPTIONS[0],
      reminderEnabled: existingHabit?.reminderEnabled ?? false,
      reminderTime: existingHabit?.reminderTime ?? null,
    },
  });

  const selectedColor = watch('color') ?? COLOR_OPTIONS[0]!;
  const selectedIcon = watch('icon') ?? ICON_OPTIONS[0]!;
  const selectedFrequency = watch('frequency');
  const reminderEnabled = watch('reminderEnabled');
  const reminderTime = watch('reminderTime');

  const [showTimePicker, setShowTimePicker] = useState(false);

  const onSubmit = useCallback(
    (data: HabitFormData) => {
      if (isEditing && habitId) {
        updateHabit({ id: habitId, ...data });
      } else {
        addHabit(data);
      }
      haptics.notificationSuccess();
      navigation.goBack();
    },
    [isEditing, habitId, addHabit, updateHabit, navigation],
  );

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Habit', 'This will delete all progress. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (habitId) {
            deleteHabit(habitId);
            haptics.notificationWarning();
            navigation.goBack();
          }
        },
      },
    ]);
  }, [habitId, deleteHabit, navigation]);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          {isEditing ? 'Edit Habit' : 'New Habit'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Preview */}
      <View
        style={[
          styles.preview,
          { backgroundColor: `${selectedColor}15` },
        ]}
      >
        <View
          style={[
            styles.previewIcon,
            { backgroundColor: `${selectedColor}30` },
          ]}
        >
          <Icon name={selectedIcon} size={32} color={selectedColor} />
        </View>
      </View>

      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Habit name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            icon="loop"
            autoFocus={!isEditing}
          />
        )}
      />

      {/* Frequency */}
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        Frequency
      </Text>
      <View style={styles.frequencyRow}>
        {(['daily', 'weekly'] as const).map(freq => (
          <Pressable
            key={freq}
            onPress={() => {
              setValue('frequency', freq);
              haptics.selection();
            }}
            style={[
              styles.frequencyChip,
              {
                backgroundColor:
                  selectedFrequency === freq ? colors.primary : colors.surface,
                borderColor:
                  selectedFrequency === freq ? colors.primary : colors.border,
              },
            ]}
          >
            <Icon
              name={freq === 'daily' ? 'today' : 'date-range'}
              size={18}
              color={
                selectedFrequency === freq
                  ? colors.textOnPrimary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                typography.button,
                {
                  color:
                    selectedFrequency === freq
                      ? colors.textOnPrimary
                      : colors.textSecondary,
                  marginLeft: 8,
                },
              ]}
            >
              {freq === 'daily' ? 'Daily' : 'Weekly'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Color Picker */}
      <Text style={[typography.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        Color
      </Text>
      <View style={styles.colorRow}>
        {COLOR_OPTIONS.map(color => (
          <Pressable
            key={color}
            onPress={() => {
              setValue('color', color);
              haptics.selection();
            }}
            style={[
              styles.colorDot,
              {
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: colors.background,
                transform: [{ scale: selectedColor === color ? 1.2 : 1 }],
              },
            ]}
          >
            {selectedColor === color && (
              <Icon name="check" size={16} color="white" />
            )}
          </Pressable>
        ))}
      </View>

      {/* Icon Picker */}
      <Text style={[typography.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        Icon
      </Text>
      <View style={styles.iconGrid}>
        {ICON_OPTIONS.map(iconName => (
          <Pressable
            key={iconName}
            onPress={() => {
              setValue('icon', iconName);
              haptics.selection();
            }}
            style={[
              styles.iconOption,
              {
                backgroundColor:
                  selectedIcon === iconName
                    ? `${selectedColor}20`
                    : colors.surface,
                borderColor:
                  selectedIcon === iconName
                    ? selectedColor
                    : colors.border,
              },
            ]}
          >
            <Icon
              name={iconName}
              size={22}
              color={
                selectedIcon === iconName
                  ? selectedColor
                  : colors.textTertiary
              }
            />
          </Pressable>
        ))}
      </View>

      {/* Reminder settings */}
      <View style={styles.reminderHeader}>
        <Text style={[typography.label, { color: colors.textSecondary }]}>
          Habit Reminder
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
            if (val && !reminderTime) {
              setValue('reminderTime', '09:00'); // default to 9 AM
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
        <View style={styles.timePickerContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Remind me at:
          </Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={[styles.timeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Icon name="schedule" size={20} color={colors.icon} />
            <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 8 }]}>
              {reminderTime ? formatTime(reminderTime) : '09:00 AM'}
            </Text>
          </Pressable>
        </View>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (date) {
              setValue('reminderTime', format(date, 'HH:mm'));
            }
          }}
        />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={isEditing ? 'Save Changes' : 'Create Habit'}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          fullWidth
          size="lg"
          icon={isEditing ? 'check' : 'add'}
        />
        {isEditing && (
          <Button
            title="Delete Habit"
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
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    borderRadius: radii.xl,
    marginBottom: spacing['2xl'],
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  frequencyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  actions: {
    marginTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
});
