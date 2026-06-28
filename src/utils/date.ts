/**
 * DailyDock — Date Utility Functions
 *
 * Wrappers around date-fns for consistent date handling.
 */

import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  differenceInDays,
  differenceInCalendarDays,
  parseISO,
  isValid,
  formatDistanceToNow,
} from 'date-fns';

/** Get today's date as YYYY-MM-DD */
export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Format a date string for display */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

/** Format time string (HH:mm) to display format */
export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return '';
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/** Format date for relative display */
export function formatRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Check if a date string is overdue (past and not today) */
export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  return isValid(date) && isPast(endOfDay(date)) && !isToday(date);
}

/** Check if date is today */
export function isDateToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  return isValid(date) && isToday(date);
}

/** Get an array of the last N days as YYYY-MM-DD strings */
export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    days.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return days;
}

/** Get the current week days (Mon-Sun) as YYYY-MM-DD strings */
export function getCurrentWeekDays(): string[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), 'yyyy-MM-dd'),
  );
}

/** Calculate streak from a completions record */
export function calculateStreak(
  completions: Record<string, boolean>,
  frequency: 'daily' | 'weekly' = 'daily',
): { current: number; best: number } {
  if (frequency === 'weekly') {
    // Simplified weekly streak — count consecutive weeks with at least one completion
    return calculateDailyStreak(completions); // Approximate
  }
  return calculateDailyStreak(completions);
}

function calculateDailyStreak(
  completions: Record<string, boolean>,
): { current: number; best: number } {
  let current = 0;
  let best = 0;
  let tempStreak = 0;

  const today = new Date();
  // Check from today going backwards
  let day = today;
  let foundToday = false;

  // First check if today is completed
  const todayStr = format(day, 'yyyy-MM-dd');
  if (completions[todayStr]) {
    current = 1;
    foundToday = true;
  }

  // Go backwards from yesterday (or today if not completed today)
  const startDay = foundToday ? subDays(today, 1) : today;
  if (!foundToday) {
    // If today isn't completed, start counting from yesterday
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    if (!completions[yesterdayStr]) {
      // No streak
      // Still calculate best
      const allDates = Object.keys(completions)
        .filter(k => completions[k])
        .sort()
        .reverse();

      for (let i = 0; i < allDates.length; i++) {
        tempStreak = 1;
        let j = i + 1;
        while (j < allDates.length) {
          const diff = differenceInCalendarDays(
            parseISO(allDates[i]!),
            parseISO(allDates[j]!),
          );
          if (diff === j - i) {
            tempStreak++;
            j++;
          } else {
            break;
          }
        }
        best = Math.max(best, tempStreak);
      }

      return { current: foundToday ? 1 : 0, best };
    }
  }

  // Count consecutive days
  let checkDay = foundToday ? subDays(today, 1) : subDays(today, 1);
  let streak = foundToday ? 1 : 0;

  for (let i = 0; i < 365; i++) {
    const dayStr = format(checkDay, 'yyyy-MM-dd');
    if (completions[dayStr]) {
      streak++;
      checkDay = subDays(checkDay, 1);
    } else {
      break;
    }
  }

  current = streak;
  best = Math.max(current, best);

  // Also check historical best (simplified — just use current for now)
  return { current, best };
}

/** Get greeting based on time of day */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Create ISO string for current time */
export function nowISO(): string {
  return new Date().toISOString();
}

export {
  format,
  parseISO,
  isValid,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  differenceInDays,
};
