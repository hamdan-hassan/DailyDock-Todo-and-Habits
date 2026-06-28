/**
 * DailyDock — Navigation Types
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  TasksTab: NavigatorScreenParams<TasksStackParamList>;
  HabitsTab: NavigatorScreenParams<HabitsStackParamList>;
  AnalyticsTab: undefined;
  SettingsTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  TaskForm: { taskId?: string } | undefined;
  HabitForm: { habitId?: string } | undefined;
  Search: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskForm: { taskId?: string } | undefined;
};

export type HabitsStackParamList = {
  HabitList: undefined;
  HabitForm: { habitId?: string } | undefined;
};
