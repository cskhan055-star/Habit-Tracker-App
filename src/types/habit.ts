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

export type ScreenId = 'account' | 'splash' | 'home' | 'add' | 'detail' | 'stats' | 'paywall' | 'widget';

export interface UserAccount {
  isLoggedIn: boolean;
  name: string;
  email: string;
  memberSince: string;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
  cloudSyncEnabled: boolean;
  lastSyncedAt?: string;
}

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

export type CheckInStatus = 'done' | 'missed' | 'skipped';

export interface CheckInEntry {
  status: CheckInStatus;
  dateStr: string;
}

// Map habitId -> { 'YYYY-MM-DD': 'done' | 'skipped' | 'missed' } or legacy Array of dates
export type CheckInRecordMap = Record<string, Record<string, CheckInStatus>>;
export type CheckInMap = Record<string, string[]>; // backward-compatible alias / helper

export type HabitReflectionMap = Record<string, Record<string, string>>; // habitId -> dateStr -> note text

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  consistency: number; // percentage (0-100) excluding skipped days
  consistencyScore: number; // exponential moving average score (0-100%)
  totalCheckIns: number;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // "HH:MM" 24-hour format e.g. "20:30" (8:30 PM)
  soundEnabled: boolean;
  includePendingCount: boolean;
  perHabitReminders: boolean;
}
