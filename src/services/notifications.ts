/**
 * DailyDock — Notification Service
 *
 * Wraps react-native-notify-kit (Notifee-compatible API) for local notifications.
 */

import notifee, {
  AndroidImportance,
  TriggerType,
  type TimestampTrigger,
  type Notification,
  RepeatFrequency,
} from 'react-native-notify-kit';
import { Platform } from 'react-native';

const CHANNEL_TASKS = 'dailydock-tasks';
const CHANNEL_HABITS = 'dailydock-habits';

/** Initialize notification channels (call on app start) */
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_TASKS,
      name: 'Task Reminders',
      description: 'Reminders for your tasks',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.createChannel({
      id: CHANNEL_HABITS,
      name: 'Habit Reminders',
      description: 'Daily habit reminders',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
}

/** Request notification permissions */
export async function requestPermissions(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  // Check if authorized (iOS) or implied (Android)
  return settings.authorizationStatus >= 1;
}

/** Calculate the trigger timestamp based on due date, due time, and offset in minutes */
export function calculateReminderTimestamp(
  dueDate: string, // YYYY-MM-DD
  dueTime: string | null, // HH:mm
  offsetMinutes: number
): number | null {
  const [year, month, day] = dueDate.split('-').map(Number);
  // Default to 9:00 AM if no time is provided
  let hours = 9;
  let minutes = 0;
  
  if (dueTime) {
    const [h, m] = dueTime.split(':').map(Number);
    if (h !== undefined && m !== undefined) {
      hours = h;
      minutes = m;
    }
  }

  if (year === undefined || month === undefined || day === undefined) return null;

  const targetDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const triggerTimestamp = targetDate.getTime() - (offsetMinutes * 60 * 1000);

  // If the trigger time has already passed, return null so we don't schedule it
  if (triggerTimestamp <= Date.now()) {
    return null;
  }

  return triggerTimestamp;
}

/** Schedule a task reminder */
export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  triggerTimestamp: number,
): Promise<string> {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTimestamp,
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `task-${taskId}`,
      title: '📋 Task Reminder',
      body: title,
      android: {
        channelId: CHANNEL_TASKS,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
        smallIcon: 'ic_notification',
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );

  return notificationId;
}

/** Schedule a recurring habit reminder */
export async function scheduleHabitReminder(
  habitId: string,
  name: string,
  reminderTime: string,
  frequency: 'daily' | 'weekly',
  skipToday: boolean = false,
): Promise<string> {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const triggerDate = new Date();
  triggerDate.setHours(hours ?? 9, minutes ?? 0, 0, 0);

  // If time already passed today or we explicitly want to skip today, schedule for tomorrow
  if (triggerDate.getTime() <= Date.now() || skipToday) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    repeatFrequency:
      frequency === 'daily'
        ? RepeatFrequency.DAILY
        : RepeatFrequency.WEEKLY,
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `habit-${habitId}`,
      title: '🔥 Habit Reminder',
      body: `Time to complete: ${name}`,
      android: {
        channelId: CHANNEL_HABITS,
        importance: AndroidImportance.DEFAULT,
        pressAction: { id: 'default' },
        smallIcon: 'ic_notification',
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );

  return notificationId;
}

/** Cancel a scheduled notification */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (notificationId) {
    await notifee.cancelNotification(notificationId);
  }
}

/** Cancel all notifications */
export async function cancelAllNotifications(): Promise<void> {
  await notifee.cancelAllNotifications();
}

/** Display an immediate notification */
export async function displayNotification(
  title: string,
  body: string,
): Promise<void> {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: CHANNEL_TASKS,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
}
