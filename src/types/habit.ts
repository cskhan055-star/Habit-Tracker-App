export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type HabitCategoryId = 'health' | 'work' | 'mindset' | 'craft' | 'ritual';

export interface HabitCategory {
  id: HabitCategoryId;
  label: string;
  color: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category?: HabitCategoryId;
  frequency: HabitFrequency;
  customDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  reminderEnabled: boolean;
  reminderTime: string;
  timeOfDay: string; // e.g. "anytime", "evening", "6:30 AM", "night", "morning"
  createdAt: string; // YYYY-MM-DD
}

export type ScreenId = 'splash' | 'home' | 'add' | 'detail' | 'stats' | 'paywall' | 'widget';

export type LuxuryTheme = 'obsidian' | 'antique-gold' | 'ivory-marble';

export interface ThemePreset {
  id: LuxuryTheme;
  name: string;
  tagline: string;
  bgHex: string;
  surfaceHex: string;
  goldHex: string;
  textHex: string;
}

export type CheckInMap = Record<string, string[]>; // habitId -> Array of 'YYYY-MM-DD' strings

export type HabitReflectionMap = Record<string, Record<string, string>>; // habitId -> dateStr -> note text

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  consistency: number;
  totalCheckIns: number;
}
