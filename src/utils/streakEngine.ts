import { Habit, CheckInStatus, HabitStats } from '../types/habit';

// Current reference date is September 24, 2026 (matches design spec "Thursday, 24 September")
export const DEFAULT_CURRENT_DATE = '2026-09-24';

/**
 * Parses YYYY-MM-DD to Date in local time
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats Date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if a given habit is scheduled on a specific date
 */
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  if (habit.frequency === 'daily') {
    return true;
  }
  if (habit.frequency === 'weekly') {
    // Scheduled once per week, default to Monday
    return true;
  }
  if (habit.frequency === 'custom' && habit.customDays && habit.customDays.length > 0) {
    const dayOfWeek = date.getDay(); // 0 is Sunday
    return habit.customDays.includes(dayOfWeek);
  }
  return true;
}

/**
 * Normalizes checkIns lookup for backward compatibility and feature 2 (status: done | skipped | missed).
 * Accepts either:
 * - string[] (legacy list of completed date strings)
 * - Record<string, CheckInStatus> (e.g. { '2026-09-24': 'done', '2026-09-23': 'skipped' })
 */
export function getHabitDayStatus(
  habitCheckIns: string[] | Record<string, CheckInStatus> | undefined,
  dateStr: string
): CheckInStatus | 'none' {
  if (!habitCheckIns) return 'none';
  if (Array.isArray(habitCheckIns)) {
    return habitCheckIns.includes(dateStr) ? 'done' : 'none';
  }
  return habitCheckIns[dateStr] || 'none';
}

/**
 * Checks if habit is completed on a date
 */
export function isHabitDoneOnDate(
  habitCheckIns: string[] | Record<string, CheckInStatus> | undefined,
  dateStr: string
): boolean {
  return getHabitDayStatus(habitCheckIns, dateStr) === 'done';
}

/**
 * Checks if habit is marked skipped / travel protected on a date
 */
export function isHabitSkippedOnDate(
  habitCheckIns: string[] | Record<string, CheckInStatus> | undefined,
  dateStr: string
): boolean {
  return getHabitDayStatus(habitCheckIns, dateStr) === 'skipped';
}

/**
 * Computes individual habit statistics:
 * 1. Current Streak: Consecutive completed days. Skipped days do NOT break streak (streak continues through them).
 * 2. Longest Streak: Highest consecutive run of scheduled days completed (skipped days bridged).
 * 3. Consistency %: Total completed / Total valid scheduled days (skipped days excluded from denominator).
 * 4. Smart Consistency Score: Exponential moving average:
 *    score_today = alpha * completion_today + (1 - alpha) * score_yesterday (alpha = 0.2).
 *    Skipped days are completely excluded from the EMA calculation (not treated as 0 or 1).
 */
export function calculateHabitStats(
  habit: Habit,
  checkIns: Record<string, string[] | Record<string, CheckInStatus>>,
  todayStr: string = DEFAULT_CURRENT_DATE,
  alpha: number = 0.2
): HabitStats {
  const habitRecords = checkIns[habit.id];
  const today = parseDate(todayStr);
  const created = parseDate(habit.createdAt);

  // 1. Current Streak
  // Start from today if done or skipped. If not done today, check if yesterday was done/skipped so streak isn't lost yet today.
  let currentStreak = 0;
  let checkCursor = new Date(today);
  const todayStatus = getHabitDayStatus(habitRecords, formatDate(checkCursor));

  if (todayStatus !== 'done' && todayStatus !== 'skipped') {
    // Today not completed yet, start check from yesterday
    checkCursor.setDate(checkCursor.getDate() - 1);
  }

  while (checkCursor >= created) {
    const dateStr = formatDate(checkCursor);
    const scheduled = isHabitScheduledOnDate(habit, checkCursor);

    if (scheduled) {
      const status = getHabitDayStatus(habitRecords, dateStr);
      if (status === 'done') {
        currentStreak++;
      } else if (status === 'skipped') {
        // Feature 2: Skipped days bridge the streak without breaking it!
        // Streak continues through them.
      } else {
        // Missed / uncompleted scheduled day breaks raw streak
        break;
      }
    }
    checkCursor.setDate(checkCursor.getDate() - 1);
  }

  // 2. Longest Streak & 4. Exponential Moving Average Consistency Score
  // Walk forward from creation date to today
  let longestStreak = 0;
  let runningStreak = 0;
  let totalCheckIns = 0;
  let validScheduledDays = 0;
  let completedScheduledDays = 0;

  // EMA initialization: initial score is null until first scheduled non-skipped day
  let emaScore: number | null = null;

  const loopDate = new Date(created);
  while (loopDate <= today) {
    const dateStr = formatDate(loopDate);
    const scheduled = isHabitScheduledOnDate(habit, loopDate);

    if (scheduled) {
      const status = getHabitDayStatus(habitRecords, dateStr);

      if (status === 'done') {
        runningStreak++;
        totalCheckIns++;
        validScheduledDays++;
        completedScheduledDays++;

        // EMA update: completion_today = 1.0
        if (emaScore === null) {
          emaScore = 1.0;
        } else {
          emaScore = alpha * 1.0 + (1 - alpha) * emaScore;
        }

        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else if (status === 'skipped') {
        // Feature 2: Skipped days are excluded entirely from both:
        // - Consistency denominator
        // - Consistency score's exponential smoothing (excluded from calculation, not treated as 0 or 1)
        // - Running streak continues through them!
      } else {
        // Missed or uncompleted scheduled day (treated as 0 if past or if today has passed)
        // Only evaluate as missed if before today, or if today and actively marked missed
        runningStreak = 0;
        validScheduledDays++;

        if (emaScore === null) {
          emaScore = 0.0;
        } else {
          emaScore = alpha * 0.0 + (1 - alpha) * emaScore;
        }
      }
    }

    loopDate.setDate(loopDate.getDate() + 1);
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // 3. Consistency %: completions / (scheduled days - skipped days)
  const consistency = validScheduledDays > 0
    ? Math.min(100, Math.round((completedScheduledDays / validScheduledDays) * 100))
    : 100;

  // Consistency Score % (0-100 rounded)
  const consistencyScore = emaScore !== null ? Math.min(100, Math.round(emaScore * 100)) : 100;

  return {
    currentStreak,
    longestStreak,
    consistency,
    consistencyScore,
    totalCheckIns,
  };
}

/**
 * Calculates overall app streak across all habits (bridges skipped days)
 */
export function calculateOverallStreak(
  habits: Habit[],
  checkIns: Record<string, string[] | Record<string, CheckInStatus>>,
  todayStr: string = DEFAULT_CURRENT_DATE
): number {
  if (habits.length === 0) return 0;

  const today = parseDate(todayStr);
  let streak = 0;
  let cursor = new Date(today);

  const isDateActive = (d: Date) => {
    const dStr = formatDate(d);
    return habits.some((h) => {
      const status = getHabitDayStatus(checkIns[h.id], dStr);
      return status === 'done' || status === 'skipped';
    });
  };

  if (!isDateActive(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // Walk backwards
  for (let i = 0; i < 365; i++) {
    if (isDateActive(cursor)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Returns past 7 days data for weekly overview bar charts
 */
export function getWeeklyOverview(
  habits: Habit[],
  checkIns: Record<string, string[] | Record<string, CheckInStatus>>,
  todayStr: string = DEFAULT_CURRENT_DATE
) {
  const today = parseDate(todayStr);

  const day = today.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekData = [];
  let totalCompletionsThisWeek = 0;
  let totalPossibleThisWeek = 0;

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(monday);
    curDate.setDate(monday.getDate() + i);
    const curStr = formatDate(curDate);
    const isFuture = curDate > today;
    const isToday = curStr === todayStr;

    let scheduledHabits = 0;
    let completedHabits = 0;
    let skippedHabits = 0;

    habits.forEach((h) => {
      if (isHabitScheduledOnDate(h, curDate)) {
        const status = getHabitDayStatus(checkIns[h.id], curStr);
        if (status === 'skipped') {
          skippedHabits++;
        } else {
          scheduledHabits++;
          if (status === 'done') {
            completedHabits++;
          }
        }
      }
    });

    const completionRate = scheduledHabits > 0 ? completedHabits / scheduledHabits : 0;

    if (!isFuture) {
      totalCompletionsThisWeek += completedHabits;
      totalPossibleThisWeek += scheduledHabits;
    }

    weekData.push({
      label: daysLabels[i],
      dateStr: curStr,
      dayNumber: curDate.getDate(),
      completedHabits,
      scheduledHabits,
      skippedHabits,
      completionRate,
      isFuture,
      isToday,
    });
  }

  const weeklyPercentage = totalPossibleThisWeek > 0
    ? Math.round((totalCompletionsThisWeek / totalPossibleThisWeek) * 100)
    : 0;

  return {
    weekData,
    weeklyPercentage,
  };
}

/**
 * Heatmap cell model for monthly calendar
 */
export interface HeatmapDay {
  dayNumber: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  status: CheckInStatus | 'none';
  intensity: number; // 0 to 1 opacity
}

/**
 * Generates month calendar heatmap data for a given habit
 */
export function getMonthlyHeatmapData(
  habitId: string,
  year: number,
  month: number, // 0-indexed (8 = September)
  checkIns: Record<string, string[] | Record<string, CheckInStatus>>,
  todayStr: string = DEFAULT_CURRENT_DATE
): HeatmapDay[] {
  const today = parseDate(todayStr);
  const habitRecords = checkIns[habitId];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week for first day (0=Sunday, 1=Monday). Adjust so Monday=0
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const result: HeatmapDay[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, d);
    const dateStr = formatDate(prevDate);
    const status = getHabitDayStatus(habitRecords, dateStr);
    const isCompleted = status === 'done';
    const isSkipped = status === 'skipped';

    result.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: prevDate > today,
      isCompleted,
      isSkipped,
      status,
      intensity: isCompleted ? 0.8 : isSkipped ? 0.5 : 0,
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = formatDate(curDate);
    const isFuture = curDate > today;
    const status = getHabitDayStatus(habitRecords, dateStr);
    const isCompleted = status === 'done';
    const isSkipped = status === 'skipped';

    let intensity = 0;
    if (isCompleted) {
      intensity = 1.0;
    } else if (isSkipped) {
      intensity = 0.6;
    }

    result.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture,
      isCompleted,
      isSkipped,
      status,
      intensity,
    });
  }

  // Next month leading days to complete grid to 35 or 42 cells
  const remainingCells = (7 - (result.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = formatDate(nextDate);
    result.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
      isFuture: true,
      isCompleted: false,
      isSkipped: false,
      status: 'none',
      intensity: 0,
    });
  }

  return result;
}
