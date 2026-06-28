/**
 * DailyDock — Habit Validation Schema (Zod)
 */

import { z } from 'zod';

export const habitSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be under 100 characters'),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
  color: z.string().optional(),
  icon: z.string().optional(),
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.string().nullable().default(null),
});

/** Output type — what you get after validation (all defaults applied) */
export type HabitFormData = z.output<typeof habitSchema>;

/** Input type — what the form submits before Zod defaults fill in */
export type HabitFormInput = z.input<typeof habitSchema>;
