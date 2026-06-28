/**
 * DailyDock — Task Categories
 */

import type { TaskCategory } from '../types';

export interface CategoryConfig {
  key: TaskCategory;
  label: string;
  colorKey: keyof typeof categoryColorKeys;
  icon: string;
}

const categoryColorKeys = {
  personal: 'categoryPersonal',
  work: 'categoryWork',
  school: 'categorySchool',
  health: 'categoryHealth',
  shopping: 'categoryShopping',
  custom: 'categoryCustom',
} as const;

export const CATEGORIES: CategoryConfig[] = [
  { key: 'personal', label: 'Personal', colorKey: 'personal', icon: 'person' },
  { key: 'work', label: 'Work', colorKey: 'work', icon: 'work' },
  { key: 'school', label: 'School', colorKey: 'school', icon: 'school' },
  { key: 'health', label: 'Health', colorKey: 'health', icon: 'favorite' },
  { key: 'shopping', label: 'Shopping', colorKey: 'shopping', icon: 'shopping-cart' },
  { key: 'custom', label: 'Custom', colorKey: 'custom', icon: 'label' },
];

export function getCategoryConfig(key: TaskCategory): CategoryConfig {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[5]!;
}

export { categoryColorKeys };
