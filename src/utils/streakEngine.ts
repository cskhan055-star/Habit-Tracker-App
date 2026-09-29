import { Habit, CheckInMap, HabitStats } from '../types/habit';

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
    // Scheduled once per week, default to Mondays or check-in days
    return true;
  }
  if (habit.frequency === 'custom' && habit.customDays && habit.customDays.length > 0) {
    const dayOfWeek = date.getDay(); // 0 is Sunday
    return habit.customDays.includes(dayOfWeek);
  }
  return true;
}

/**
 * Computes individual habit statistics (Current streak, Longest streak, Consistency %, Total check-ins)
 */
export function calculateHabitStats(
  habit: Habit,
  checkIns: CheckInMap,
  todayStr: string = DEFAULT_CURRENT_DATE
): HabitStats {
  const habitDates = checkIns[habit.id] || [];
  const checkInSet = new Set(habitDates);
  const totalCheckIns = checkInSet.size;

  const today = parseDate(todayStr);
  const created = parseDate(habit.createdAt);

  // 1. Current Streak
  let currentStreak = 0;
  let checkCursor = new Date(today);
  const todayChecked = checkInSet.has(formatDate(checkCursor));

  // If today is checked, start streak counting from today
  // If not checked yet today, check if yesterday was checked so streak isn't lost yet
  if (!todayChecked) {
    checkCursor.setDate(checkCursor.getDate() - 1);
  }

  while (checkCursor >= created) {
    const dateStr = formatDate(checkCursor);
    const scheduled = isHabitScheduledOnDate(habit, checkCursor);

    if (scheduled) {
      if (checkInSet.has(dateStr)) {
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    }
    checkCursor.setDate(checkCursor.getDate() - 1);
  }

  // 2. Longest Streak
  // Walk through from creation to today
  let longestStreak = 0;
  let runningStreak = 0;
  const loopDate = new Date(created);

  while (loopDate <= today) {
    const dateStr = formatDate(loopDate);
    const scheduled = isHabitScheduledOnDate(habit, loopDate);

    if (scheduled) {
      if (checkInSet.has(dateStr)) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
    }
    loopDate.setDate(loopDate.getDate() + 1);
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // 3. Consistency %: completions / scheduled days since creation
  let scheduledDaysCount = 0;
  let completedScheduledCount = 0;
  const countDate = new Date(created);

  while (countDate <= today) {
    const scheduled = isHabitScheduledOnDate(habit, countDate);
    if (scheduled) {
      scheduledDaysCount++;
      if (checkInSet.has(formatDate(countDate))) {
        completedScheduledCount++;
      }
    }
    countDate.setDate(countDate.getDate() + 1);
  }

  const consistency = scheduledDaysCount > 0
    ? Math.min(100, Math.round((completedScheduledCount / scheduledDaysCount) * 100))
    : 100;

  return {
    currentStreak,
    longestStreak,
    consistency,
    totalCheckIns,
  };
}

/**
 * Calculates overall app streak across all habits
 */
export function calculateOverallStreak(
  habits: Habit[],
  checkIns: CheckInMap,
  todayStr: string = DEFAULT_CURRENT_DATE
): number {
  if (habits.length === 0) return 0;

  const today = parseDate(todayStr);
  let streak = 0;
  let cursor = new Date(today);

  // Check if at least 1 habit checked today
  const isDateActive = (d: Date) => {
    const dStr = formatDate(d);
    return habits.some((h) => (checkIns[h.id] || []).includes(dStr));
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
 * Returns past 7 days (Monday - Sunday or past 7 days) data for bar charts
 */
export function getWeeklyOverview(
  habits: Habit[],
  checkIns: CheckInMap,
  todayStr: string = DEFAULT_CURRENT_DATE
) {
  const today = parseDate(todayStr);
  
  // Find Monday of current week (ISO week)
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

    habits.forEach((h) => {
      if (isHabitScheduledOnDate(h, curDate)) {
        scheduledHabits++;
        if ((checkIns[h.id] || []).includes(curStr)) {
          completedHabits++;
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
  intensity: number; // 0 to 1 opacity
}

/**
 * Generates month calendar heatmap data for a given habit
 */
export function getMonthlyHeatmapData(
  habitId: string,
  year: number,
  month: number, // 0-indexed (8 = September)
  checkIns: CheckInMap,
  todayStr: string = DEFAULT_CURRENT_DATE
): HeatmapDay[] {
  const today = parseDate(todayStr);
  const habitDates = new Set(checkIns[habitId] || []);

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
    const isCompleted = habitDates.has(dateStr);
    result.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: prevDate > today,
      isCompleted,
      intensity: isCompleted ? 0.8 : 0,
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = formatDate(curDate);
    const isFuture = curDate > today;
    const isCompleted = habitDates.has(dateStr);

    // Calculate intensity: completed is full/varied opacity based on streak continuity
    let intensity = 0;
    if (isCompleted) {
      intensity = 1.0;
    } else if (!isFuture) {
      // Missed day: subtle 0 intensity or low trace if partial
      intensity = 0;
    }

    result.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture,
      isCompleted,
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
      intensity: 0,
    });
  }

  return result;
}
