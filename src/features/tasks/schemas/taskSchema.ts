/**
 * DailyDock — Task Validation Schema (Zod)
 */

import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .default(''),
  dueDate: z.string().nullable().default(null),
  dueTime: z.string().nullable().default(null),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z
    .enum(['personal', 'work', 'school', 'health', 'shopping', 'custom'])
    .default('personal'),
  reminderEnabled: z.boolean().default(false),
  reminderOffset: z.number().nullable().default(null),
});

/** Output type — what you get after validation (all defaults applied) */
export type TaskFormData = z.output<typeof taskSchema>;

/** Input type — what the form submits before Zod defaults fill in */
export type TaskFormInput = z.input<typeof taskSchema>;
