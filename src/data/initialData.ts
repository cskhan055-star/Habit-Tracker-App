import { Habit, CheckInMap, HabitReflectionMap } from '../types/habit';
import { formatDate, parseDate, DEFAULT_CURRENT_DATE } from '../utils/streakEngine';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Drink 2L Water',
    icon: 'water',
    category: 'health',
    frequency: 'daily',
    timeOfDay: 'anytime',
    reminderEnabled: true,
    reminderTime: '10:00 AM',
    createdAt: '2026-04-10',
  },
  {
    id: 'habit-2',
    name: 'Read 20 Pages',
    icon: 'book',
    category: 'mindset',
    frequency: 'daily',
    timeOfDay: 'evening',
    reminderEnabled: true,
    reminderTime: '8:30 PM',
    createdAt: '2026-02-01',
  },
  {
    id: 'habit-3',
    name: 'Morning Workout',
    icon: 'workout',
    category: 'health',
    frequency: 'daily',
    timeOfDay: '6:30 AM',
    reminderEnabled: true,
    reminderTime: '06:15 AM',
    createdAt: '2026-05-15',
  },
  {
    id: 'habit-4',
    name: 'Sleep by 11 PM',
    icon: 'sleep',
    category: 'health',
    frequency: 'daily',
    timeOfDay: 'night',
    reminderEnabled: true,
    reminderTime: '10:30 PM',
    createdAt: '2026-06-20',
  },
  {
    id: 'habit-5',
    name: 'Meditate',
    icon: 'meditate',
    category: 'ritual',
    frequency: 'daily',
    timeOfDay: 'morning',
    reminderEnabled: false,
    reminderTime: '07:30 AM',
    createdAt: '2026-08-01',
  },
];

/**
 * Generates initial check-in history that matches the design document figures:
 * - Read 20 Pages has 47 day streak leading to today (2026-09-24)
 * - Morning Workout has 8 day streak leading to today
 * - Drink 2L Water has 12 day streak leading to today
 * - Sleep by 11 PM has 3 day streak (yesterday was checked, today not yet)
 * - Meditate has 0 streak (missed yesterday)
 * - Total check-ins ~ 612
 */
export function generateInitialCheckIns(): CheckInMap {
  const checkIns: CheckInMap = {
    'habit-1': [],
    'habit-2': [],
    'habit-3': [],
    'habit-4': [],
    'habit-5': [],
  };

  const today = parseDate(DEFAULT_CURRENT_DATE);

  // Generate 240 days of history back to Feb 1, 2026
  for (let i = 0; i <= 240; i++) {
    const cur = new Date(today);
    cur.setDate(today.getDate() - i);
    const dateStr = formatDate(cur);

    // Habit 2: Read 20 pages (47-day streak ending today 2026-09-24)
    // Between day 0 and 46 (47 days total) checked every single day
    if (i <= 46) {
      checkIns['habit-2'].push(dateStr);
    } else if (i < 235) {
      // Historical consistency ~91%
      if (i % 11 !== 0) {
        checkIns['habit-2'].push(dateStr);
      }
    }

    // Habit 1: Drink 2L water (12-day streak ending today)
    if (i <= 11) {
      checkIns['habit-1'].push(dateStr);
    } else if (i < 160) {
      if (i % 4 !== 0) {
        checkIns['habit-1'].push(dateStr);
      }
    }

    // Habit 3: Morning Workout (8-day streak ending today)
    if (i <= 7) {
      checkIns['habit-3'].push(dateStr);
    } else if (i < 130) {
      if (i % 6 !== 0) {
        checkIns['habit-3'].push(dateStr);
      }
    }

    // Habit 4: Sleep by 11 PM (3-day streak ending yesterday, not yet checked today)
    if (i >= 1 && i <= 3) {
      checkIns['habit-4'].push(dateStr);
    } else if (i < 95) {
      if (i % 3 !== 0) {
        checkIns['habit-4'].push(dateStr);
      }
    }

    // Habit 5: Meditate (0 streak, missed today and yesterday, scattered past)
    if (i > 2 && i < 54) {
      if (i % 2 === 0) {
        checkIns['habit-5'].push(dateStr);
      }
    }
  }

  return checkIns;
}

export function generateInitialReflections(): HabitReflectionMap {
  return {
    'habit-2': {
      '2026-09-24': 'Completed Marcus Aurelius Meditations Book IV. Quiet evening reflection on restraint.',
      '2026-09-23': 'Read Seneca’s Letters on the shortness of life. Struck by his reflections on reclaiming lost hours.',
      '2026-09-22': 'Finished chapter 6 of Antifragile over chamomile tea.',
      '2026-09-20': 'Deep immersion in architecture theory. The interplay of obsidian geometry and light.',
    },
    'habit-3': {
      '2026-09-24': 'Kettlebell swings and cold plunge at 6:30 AM. Exceptional mental clarity.',
      '2026-09-22': '5km tempo run in crisp morning air. Kept heart rate steady.',
    },
    'habit-1': {
      '2026-09-24': 'Met target by 3 PM with infused cucumber mint water.',
    },
  };
}
