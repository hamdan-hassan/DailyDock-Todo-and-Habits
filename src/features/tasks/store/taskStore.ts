/**
 * DailyDock — Task Store (Zustand + MMKV)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../../../services/storage';
import { generateId } from '../../../utils/id';
import { nowISO, getTodayDate, isOverdue, isDateToday } from '../../../utils/date';
import { scheduleTaskReminder, cancelNotification, calculateReminderTimestamp } from '../../../services/notifications';
import type {
  Task,
  TaskPriority,
  TaskCategory,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../../types';

interface TaskState {
  tasks: Task[];
  addTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByCategory: (category: TaskCategory) => Task[];
  getCompletedCountForDate: (date: string) => number;
  getTotalCompletedCount: () => number;
  searchTasks: (query: string) => Task[];
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: async (input: CreateTaskInput): Promise<Task> => {
        const now = nowISO();
        
        let notificationId: string | null = null;
        if (input.reminderEnabled && input.dueDate) {
          const timestamp = calculateReminderTimestamp(input.dueDate, input.dueTime ?? null, input.reminderOffset ?? 60);
          if (timestamp) {
            const tempId = generateId();
            const id = await scheduleTaskReminder(tempId, input.title, timestamp);
            if (id) notificationId = id;
          }
        }

        const newTask: Task = {
          id: generateId(),
          title: input.title,
          description: input.description ?? '',
          dueDate: input.dueDate ?? null,
          dueTime: input.dueTime ?? null,
          priority: input.priority,
          category: input.category,
          status: 'active',
          completedAt: null,
          reminderEnabled: input.reminderEnabled ?? false,
          reminderOffset: input.reminderOffset ?? null,
          notificationId,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: async (input: UpdateTaskInput): Promise<void> => {
        const state = get();
        const existingTask = state.tasks.find(t => t.id === input.id);
        if (!existingTask) return;

        let newNotificationId = existingTask.notificationId;

        // Cancel old notification if we are updating reminder settings or due date
        if (
          existingTask.notificationId &&
          (input.reminderEnabled === false || 
           input.dueDate !== undefined || 
           input.dueTime !== undefined || 
           input.reminderOffset !== undefined ||
           input.title !== undefined)
        ) {
          await cancelNotification(existingTask.notificationId);
          newNotificationId = null;
        }

        // Reschedule if reminder is enabled
        const finalReminderEnabled = input.reminderEnabled ?? existingTask.reminderEnabled;
        const finalDueDate = input.dueDate !== undefined ? input.dueDate : existingTask.dueDate;
        const finalDueTime = input.dueTime !== undefined ? input.dueTime : existingTask.dueTime;
        const finalReminderOffset = input.reminderOffset !== undefined ? input.reminderOffset : existingTask.reminderOffset;
        const finalTitle = input.title !== undefined ? input.title : existingTask.title;

        if (finalReminderEnabled && finalDueDate && !newNotificationId) {
          const timestamp = calculateReminderTimestamp(finalDueDate, finalDueTime, finalReminderOffset ?? 60);
          if (timestamp) {
            const id = await scheduleTaskReminder(existingTask.id, finalTitle, timestamp);
            if (id) newNotificationId = id;
          }
        }

        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === input.id
              ? {
                  ...task,
                  ...input,
                  notificationId: newNotificationId,
                  updatedAt: nowISO(),
                }
              : task,
          ),
        }));
      },

      deleteTask: async (id: string): Promise<void> => {
        const state = get();
        const existingTask = state.tasks.find(t => t.id === id);
        if (existingTask?.notificationId) {
          await cancelNotification(existingTask.notificationId);
        }

        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
        }));
      },

      toggleComplete: async (id: string): Promise<void> => {
        const state = get();
        const existingTask = state.tasks.find(t => t.id === id);
        if (!existingTask) return;

        const isNowCompleted = existingTask.status !== 'completed';

        // If completed, cancel any pending notification
        if (isNowCompleted && existingTask.notificationId) {
          await cancelNotification(existingTask.notificationId);
        } else if (!isNowCompleted && existingTask.reminderEnabled && existingTask.dueDate) {
          // If un-completed, try to reschedule
          const timestamp = calculateReminderTimestamp(existingTask.dueDate, existingTask.dueTime, existingTask.reminderOffset ?? 60);
          let newNotificationId = existingTask.notificationId;
          if (timestamp) {
            const notifId = await scheduleTaskReminder(existingTask.id, existingTask.title, timestamp);
            if (notifId) newNotificationId = notifId;
          }
          existingTask.notificationId = newNotificationId;
        }

        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? {
                  ...task,
                  status: isNowCompleted ? ('completed' as TaskStatus) : ('active' as TaskStatus),
                  completedAt: isNowCompleted ? nowISO() : null,
                  notificationId: existingTask.notificationId, // update with rescheduled ID if any
                  updatedAt: nowISO(),
                }
              : task,
          ),
        }));
      },

      getTodayTasks: (): Task[] => {
        return get().tasks.filter(
          t => t.status === 'active' && isDateToday(t.dueDate),
        );
      },

      getUpcomingTasks: (): Task[] => {
        const today = getTodayDate();
        return get()
          .tasks.filter(
            t =>
              t.status === 'active' &&
              t.dueDate &&
              t.dueDate > today,
          )
          .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
      },

      getOverdueTasks: (): Task[] => {
        return get().tasks.filter(
          t => t.status === 'active' && isOverdue(t.dueDate),
        );
      },

      getCompletedTasks: (): Task[] => {
        return get()
          .tasks.filter(t => t.status === 'completed')
          .sort(
            (a, b) =>
              (b.completedAt ?? '').localeCompare(a.completedAt ?? ''),
          );
      },

      getTaskById: (id: string): Task | undefined => {
        return get().tasks.find(t => t.id === id);
      },

      getTasksByCategory: (category: TaskCategory): Task[] => {
        return get().tasks.filter(t => t.category === category);
      },

      getCompletedCountForDate: (date: string): number => {
        return get().tasks.filter(
          t =>
            t.status === 'completed' &&
            t.completedAt &&
            t.completedAt.startsWith(date),
        ).length;
      },

      getTotalCompletedCount: (): number => {
        return get().tasks.filter(t => t.status === 'completed').length;
      },

      searchTasks: (query: string): Task[] => {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return get().tasks.filter(
          t =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q),
        );
      },

      clearCompleted: (): void => {
        set(state => ({
          tasks: state.tasks.filter(t => t.status !== 'completed'),
        }));
      },
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => createMMKVStorage('tasks')),
    },
  ),
);
