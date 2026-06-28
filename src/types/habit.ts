/**
 * DailyDock — Habit Types
 */

export type HabitFrequency = 'daily' | 'weekly';

export interface HabitCompletion {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  color: string; // hex color
  icon: string; // icon name
  reminderEnabled: boolean;
  reminderTime: string | null; // HH:mm format
  notificationId: string | null;
  completions: Record<string, boolean>; // { 'YYYY-MM-DD': true }
  currentStreak: number;
  bestStreak: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateHabitInput {
  name: string;
  frequency: HabitFrequency;
  color?: string;
  icon?: string;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  id: string;
}
