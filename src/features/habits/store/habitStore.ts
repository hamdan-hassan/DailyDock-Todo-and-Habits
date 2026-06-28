/**
 * DailyDock — Habit Store (Zustand + MMKV)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../../../services/storage';
import { generateId } from '../../../utils/id';
import { nowISO, getTodayDate, calculateStreak } from '../../../utils/date';
import { palette } from '../../../theme/colors';
import { scheduleHabitReminder, cancelNotification } from '../../../services/notifications';
import type {
  Habit,
  HabitFrequency,
  CreateHabitInput,
  UpdateHabitInput,
} from '../../../types';

const DEFAULT_COLORS = [
  palette.indigo500,
  palette.violet500,
  palette.emerald500,
  palette.amber500,
  palette.rose500,
  palette.sky500,
  palette.teal500,
  palette.orange500,
];

const DEFAULT_ICONS = [
  'fitness-center',
  'self-improvement',
  'auto-stories',
  'water-drop',
  'restaurant',
  'code',
  'music-note',
  'brush',
];

interface HabitState {
  habits: Habit[];
  addHabit: (input: CreateHabitInput) => Promise<Habit>;
  updateHabit: (input: UpdateHabitInput) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (id: string, date?: string) => Promise<void>;
  getHabitById: (id: string) => Habit | undefined;
  getTodayHabits: () => Habit[];
  getCompletionRate: () => number;
  getTotalCompletedCount: () => number;
  searchHabits: (query: string) => Habit[];
  isCompletedToday: (id: string) => boolean;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: async (input: CreateHabitInput): Promise<Habit> => {
        const now = nowISO();
        const existingCount = get().habits.length;
        const newHabitId = generateId();
        
        let notificationId: string | null = null;
        if (input.reminderEnabled && input.reminderTime) {
          const id = await scheduleHabitReminder(newHabitId, input.name, input.reminderTime, input.frequency);
          if (id) notificationId = id;
        }

        const newHabit: Habit = {
          id: newHabitId,
          name: input.name,
          frequency: input.frequency,
          color: input.color ?? DEFAULT_COLORS[existingCount % DEFAULT_COLORS.length]!,
          icon: input.icon ?? DEFAULT_ICONS[existingCount % DEFAULT_ICONS.length]!,
          reminderEnabled: input.reminderEnabled ?? false,
          reminderTime: input.reminderTime ?? null,
          notificationId,
          completions: {},
          currentStreak: 0,
          bestStreak: 0,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ habits: [newHabit, ...state.habits] }));
        return newHabit;
      },

      updateHabit: async (input: UpdateHabitInput): Promise<void> => {
        const state = get();
        const existingHabit = state.habits.find(h => h.id === input.id);
        if (!existingHabit) return;

        let newNotificationId = existingHabit.notificationId;

        if (
          existingHabit.notificationId &&
          (input.reminderEnabled === false || 
           input.reminderTime !== undefined || 
           input.frequency !== undefined ||
           input.name !== undefined)
        ) {
          await cancelNotification(existingHabit.notificationId);
          newNotificationId = null;
        }

        const finalReminderEnabled = input.reminderEnabled ?? existingHabit.reminderEnabled;
        const finalReminderTime = input.reminderTime !== undefined ? input.reminderTime : existingHabit.reminderTime;
        const finalFrequency = input.frequency !== undefined ? input.frequency : existingHabit.frequency;
        const finalName = input.name !== undefined ? input.name : existingHabit.name;

        if (finalReminderEnabled && finalReminderTime && !newNotificationId) {
          const id = await scheduleHabitReminder(existingHabit.id, finalName, finalReminderTime, finalFrequency);
          if (id) newNotificationId = id;
        }

        set(state => ({
          habits: state.habits.map(habit =>
            habit.id === input.id
              ? { 
                  ...habit, 
                  ...input, 
                  notificationId: newNotificationId,
                  updatedAt: nowISO() 
                }
              : habit,
          ),
        }));
      },

      deleteHabit: async (id: string): Promise<void> => {
        const state = get();
        const existingHabit = state.habits.find(h => h.id === id);
        if (existingHabit?.notificationId) {
          await cancelNotification(existingHabit.notificationId);
        }

        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
        }));
      },

      toggleCompletion: async (id: string, date?: string): Promise<void> => {
        const targetDate = date ?? getTodayDate();
        const state = get();
        const existingHabit = state.habits.find(h => h.id === id);
        if (!existingHabit) return;

        const isToday = targetDate === getTodayDate();
        const isNowCompleted = !existingHabit.completions[targetDate];
        
        let newNotificationId = existingHabit.notificationId;

        if (isToday && existingHabit.reminderEnabled && existingHabit.reminderTime) {
          if (existingHabit.notificationId) {
            await cancelNotification(existingHabit.notificationId);
          }
          
          const notifId = await scheduleHabitReminder(
            existingHabit.id, 
            existingHabit.name, 
            existingHabit.reminderTime, 
            existingHabit.frequency, 
            isNowCompleted
          );
          if (notifId) newNotificationId = notifId;
        }

        set(state => ({
          habits: state.habits.map(habit => {
            if (habit.id !== id) return habit;

            const newCompletions = { ...habit.completions };
            if (newCompletions[targetDate]) {
              delete newCompletions[targetDate];
            } else {
              newCompletions[targetDate] = true;
            }

            const { current, best } = calculateStreak(
              newCompletions,
              habit.frequency,
            );

            return {
              ...habit,
              completions: newCompletions,
              notificationId: newNotificationId,
              currentStreak: current,
              bestStreak: Math.max(best, habit.bestStreak),
              updatedAt: nowISO(),
            };
          }),
        }));
      },

      getHabitById: (id: string): Habit | undefined => {
        return get().habits.find(h => h.id === id);
      },

      getTodayHabits: (): Habit[] => {
        return get().habits.filter(h => h.frequency === 'daily');
      },

      getCompletionRate: (): number => {
        const habits = get().habits;
        if (habits.length === 0) return 0;
        const today = getTodayDate();
        const completedToday = habits.filter(
          h => h.completions[today],
        ).length;
        return Math.round((completedToday / habits.length) * 100);
      },

      getTotalCompletedCount: (): number => {
        return get().habits.reduce(
          (total, h) =>
            total +
            Object.values(h.completions).filter(Boolean).length,
          0,
        );
      },

      searchHabits: (query: string): Habit[] => {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return get().habits.filter(h =>
          h.name.toLowerCase().includes(q),
        );
      },

      isCompletedToday: (id: string): boolean => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return false;
        return habit.completions[getTodayDate()] === true;
      },
    }),
    {
      name: 'habits-store',
      storage: createJSONStorage(() => createMMKVStorage('habits')),
    },
  ),
);
