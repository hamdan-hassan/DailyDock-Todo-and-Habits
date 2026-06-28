/**
 * DailyDock — Priority Levels
 */

import type { TaskPriority } from '../types';

export interface PriorityConfig {
  key: TaskPriority;
  label: string;
  colorKey: string;
  icon: string;
  order: number;
}

export const PRIORITIES: PriorityConfig[] = [
  { key: 'low', label: 'Low', colorKey: 'priorityLow', icon: 'arrow-downward', order: 0 },
  { key: 'medium', label: 'Medium', colorKey: 'priorityMedium', icon: 'remove', order: 1 },
  { key: 'high', label: 'High', colorKey: 'priorityHigh', icon: 'arrow-upward', order: 2 },
  { key: 'urgent', label: 'Urgent', colorKey: 'priorityUrgent', icon: 'priority-high', order: 3 },
];

export function getPriorityConfig(key: TaskPriority): PriorityConfig {
  return PRIORITIES.find(p => p.key === key) ?? PRIORITIES[0]!;
}
