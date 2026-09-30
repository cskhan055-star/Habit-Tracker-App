/**
 * Unit tests for Feature 1 (Smart Consistency Score EMA) & Feature 2 (Skip Day / Travel Protection)
 *
 * Edge cases covered:
 * 1. First-ever check-in
 * 2. Habit with custom (non-daily) frequency (e.g. Mon, Wed, Fri)
 * 3. Multiple consecutive missed days (exponential decay smoothing, non-shaming)
 * 4. Skip day / Travel protection (streak preserved, skipped days excluded from denominator and EMA)
 */

import { Habit, CheckInStatus } from '../types/habit';
import { calculateHabitStats } from './streakEngine';

export function runStreakEngineTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  const assert = (condition: boolean, testName: string, errorDetail?: string) => {
    if (condition) {
      results.push({ name: testName, passed: true });
    } else {
      results.push({ name: testName, passed: false, message: errorDetail || 'Assertion failed' });
    }
  };

  // Test 1: First-ever check-in
  {
    const habit: Habit = {
      id: 'test-habit-1',
      name: 'Journal',
      icon: 'book',
      frequency: 'daily',
      reminderEnabled: false,
      reminderTime: '08:00 AM',
      timeOfDay: 'morning',
      createdAt: '2026-09-24',
    };
    const checkIns: Record<string, Record<string, CheckInStatus>> = {
      'test-habit-1': {
        '2026-09-24': 'done',
      },
    };

    const stats = calculateHabitStats(habit, checkIns, '2026-09-24');
    assert(stats.currentStreak === 1, 'First-ever check-in gives streak of 1', `Expected 1, got ${stats.currentStreak}`);
    assert(stats.consistencyScore === 100, 'First-ever check-in gives 100% EMA consistency score', `Expected 100, got ${stats.consistencyScore}`);
    assert(stats.consistency === 100, 'First-ever check-in gives 100% consistency rate', `Expected 100, got ${stats.consistency}`);
  }

  // Test 2: Custom (non-daily) frequency habit (e.g. Mon, Wed, Fri only)
  {
    // 2026-09-21 was Monday, 2026-09-22 was Tuesday (not scheduled), 2026-09-23 was Wednesday, 2026-09-24 Thursday (not scheduled)
    const habit: Habit = {
      id: 'test-habit-custom',
      name: 'Gym',
      icon: 'workout',
      frequency: 'custom',
      customDays: [1, 3, 5], // Mon, Wed, Fri
      reminderEnabled: false,
      reminderTime: '07:00 AM',
      timeOfDay: 'morning',
      createdAt: '2026-09-21',
    };
    const checkIns: Record<string, Record<string, CheckInStatus>> = {
      'test-habit-custom': {
        '2026-09-21': 'done', // Mon (scheduled)
        '2026-09-23': 'done', // Wed (scheduled)
      },
    };

    const stats = calculateHabitStats(habit, checkIns, '2026-09-24');
    assert(stats.currentStreak === 2, 'Custom frequency habit counts only scheduled days for streak', `Expected 2, got ${stats.currentStreak}`);
    assert(stats.consistencyScore === 100, 'Custom frequency habit achieves 100% score on scheduled days', `Expected 100, got ${stats.consistencyScore}`);
    assert(stats.consistency === 100, 'Custom frequency habit has 100% consistency on scheduled days', `Expected 100, got ${stats.consistency}`);
  }

  // Test 3: Multiple consecutive missed days (gentle exponential decay, no harsh cliff)
  {
    const habit: Habit = {
      id: 'test-habit-misses',
      name: 'Meditation',
      icon: 'meditate',
      frequency: 'daily',
      reminderEnabled: false,
      reminderTime: '08:00 AM',
      timeOfDay: 'morning',
      createdAt: '2026-09-20',
    };
    // Created on Sept 20, done on Sept 20, missed 21, 22, 23, 24
    const checkIns: Record<string, Record<string, CheckInStatus>> = {
      'test-habit-misses': {
        '2026-09-20': 'done',
      },
    };

    const stats = calculateHabitStats(habit, checkIns, '2026-09-24');
    // Day 0 (20th): score = 1.0
    // Day 1 (21st): score = 0.2*0 + 0.8*1.0 = 0.80
    // Day 2 (22nd): score = 0.2*0 + 0.8*0.80 = 0.64
    // Day 3 (23rd): score = 0.2*0 + 0.8*0.64 = 0.512
    // Day 4 (24th): score = 0.2*0 + 0.8*0.512 = 0.4096 (~41%)
    assert(stats.currentStreak === 0, 'Consecutive missed days resets raw streak to 0', `Expected 0, got ${stats.currentStreak}`);
    assert(stats.consistencyScore >= 40 && stats.consistencyScore <= 42, 'Consistency score smoothly decays rather than dropping to 0', `Expected ~41%, got ${stats.consistencyScore}%`);
  }

  // Test 4: Skip Day / Travel Protection
  {
    const habit: Habit = {
      id: 'test-habit-skip',
      name: 'Morning Workout',
      icon: 'workout',
      frequency: 'daily',
      reminderEnabled: false,
      reminderTime: '06:00 AM',
      timeOfDay: 'morning',
      createdAt: '2026-09-20',
    };
    // 2026-09-20: done
    // 2026-09-21: done
    // 2026-09-22: skipped (travel protection)
    // 2026-09-23: skipped (travel protection)
    // 2026-09-24: done
    const checkIns: Record<string, Record<string, CheckInStatus>> = {
      'test-habit-skip': {
        '2026-09-20': 'done',
        '2026-09-21': 'done',
        '2026-09-22': 'skipped',
        '2026-09-23': 'skipped',
        '2026-09-24': 'done',
      },
    };

    const stats = calculateHabitStats(habit, checkIns, '2026-09-24');
    assert(stats.currentStreak === 3, 'Streak continues through skipped days without breaking', `Expected 3, got ${stats.currentStreak}`);
    assert(stats.consistencyScore === 100, 'Skipped days are excluded from EMA smoothing, maintaining 100% score', `Expected 100, got ${stats.consistencyScore}`);
    assert(stats.consistency === 100, 'Skipped days are excluded from consistency % denominator (3 done / 3 non-skipped scheduled)', `Expected 100, got ${stats.consistency}`);
  }

  return results;
}
