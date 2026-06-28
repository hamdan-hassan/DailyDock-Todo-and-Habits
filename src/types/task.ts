/**
 * DailyDock — Task Types
 */

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory =
  | 'personal'
  | 'work'
  | 'school'
  | 'health'
  | 'shopping'
  | 'custom';

export type TaskStatus = 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null; // ISO string
  dueTime: string | null; // HH:mm format
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  completedAt: string | null; // ISO string
  reminderEnabled: boolean;
  reminderOffset: number | null; // Offset in minutes before due date
  notificationId: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  reminderEnabled?: boolean;
  reminderOffset?: number | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}
