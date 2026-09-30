import { Habit, CheckInRecordMap, NotificationSettings } from '../types/habit';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminderTime: '20:30', // 8:30 PM default
  soundEnabled: true,
  includePendingCount: true,
  perHabitReminders: true,
};

const STORAGE_KEY_SETTINGS = 'aurum_notification_settings_v1';
const STORAGE_KEY_LAST_DAILY = 'aurum_notification_last_daily_date';
const STORAGE_KEY_LAST_HABITS = 'aurum_notification_last_habit_times';

/**
 * Normalizes any time representation ("8:30 PM", "08:30 AM", "20:30", "8:30")
 * to strict 24-hour "HH:mm" format.
 */
export function normalizeTo24Hour(timeStr: string): string {
  if (!timeStr) return '20:30';
  const trimmed = timeStr.trim().toUpperCase();

  // If already standard 24h format e.g. "20:30" or "08:15"
  if (/^([01]?\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
    const [h, m] = trimmed.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }

  // If format is like "8:30 PM" or "08:30 AM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3];

    if (period === 'PM' && hour < 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  return '20:30';
}

/**
 * Formats a 24-hour "HH:mm" string into friendly 12-hour "h:mm A" string.
 */
export function formatTo12Hour(time24: string): string {
  const normalized = normalizeTo24Hour(time24);
  const [hStr, mStr] = normalized.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${period}`;
}

/**
 * Plays an elegant, golden-toned harmonic chime using Web Audio API.
 * Matches Aurum's luxury acoustic aesthetic without external mp3s.
 */
export function playLuxuryChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic frequencies for luxury chime (D5, A5, D6 chord)
    const freqs = [587.33, 880.0, 1174.66];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      // Volume envelope with gentle attack and long decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.3);
    });

    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    }, 2000);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export class NotificationService {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  public static async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }

  public static getSettings(): NotificationSettings {
    if (typeof localStorage === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...parsed,
          dailyReminderTime: normalizeTo24Hour(parsed.dailyReminderTime || DEFAULT_NOTIFICATION_SETTINGS.dailyReminderTime),
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  public static saveSettings(settings: NotificationSettings): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  /**
   * Fires a local push notification.
   * Dispatches both browser Notification API and in-app luxury banner event.
   */
  public static async sendLocalNotification(options: {
    title: string;
    body: string;
    tag?: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    const settings = this.getSettings();

    // 1. Play luxury audio chime if sound is enabled
    if (settings.soundEnabled) {
      playLuxuryChime();
    }

    // 2. Dispatch custom in-app event so the active screen renders a luxury gold toast
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aurum-inapp-notification', {
          detail: {
            title: options.title,
            body: options.body,
            timestamp: Date.now(),
          },
        })
      );
    }

    // 3. Dispatch system level notification if permissions are granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(options.title, {
              body: options.body,
              icon: '/icon.svg',
              badge: '/icon.svg',
              tag: options.tag || 'aurum-reminder',
              data: options.data,
            });
            return;
          }
        }
        // Fallback to desktop notification constructor
        new Notification(options.title, {
          body: options.body,
          icon: '/icon.svg',
          tag: options.tag || 'aurum-reminder',
        });
      } catch {
        // Handled silently
      }
    }
  }

  /**
   * Trigger an immediate test notification so users can preview the notification.
   */
  public static async triggerTestNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: 'Aurum Habit Architecture',
      body: '✨ Test notification: Your evening habit check-in is scheduled for ' + formatTo12Hour(this.getSettings().dailyReminderTime) + '.',
      tag: 'test-notification-' + Date.now(),
    });
  }

  /**
   * Evaluates habit states and fires reminders if user-defined reminder time matches now.
   */
  public static evaluateAndTriggerReminders(params: {
    habits: Habit[];
    checkInRecords: CheckInRecordMap;
    currentDate: string;
    overallStreak: number;
  }): void {
    const settings = this.getSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayStr = params.currentDate;

    // Check if daily reminder should fire
    const targetDailyHHMM = normalizeTo24Hour(settings.dailyReminderTime);
    if (currentHHMM === targetDailyHHMM) {
      const lastDaily = localStorage.getItem(STORAGE_KEY_LAST_DAILY);
      if (lastDaily !== todayStr) {
        // Count how many habits are incomplete today
        let pendingCount = 0;
        let totalCount = 0;

        params.habits.forEach((habit) => {
          totalCount++;
          const status = params.checkInRecords[habit.id]?.[todayStr];
          if (status !== 'done' && status !== 'skipped') {
            pendingCount++;
          }
        });

        let body = '';
        if (pendingCount > 0) {
          body = settings.includePendingCount
            ? `You have ${pendingCount} habit${pendingCount > 1 ? 's' : ''} remaining today. Protect your ${params.overallStreak}-day streak!`
            : `Time to check in on today's rituals and maintain your streak.`;
        } else {
          body = `All rituals completed for today! Your ${params.overallStreak}-day streak is secured.`;
        }

        this.sendLocalNotification({
          title: 'Daily Habit Check-in',
          body,
          tag: `daily-reminder-${todayStr}`,
        });

        try {
          localStorage.setItem(STORAGE_KEY_LAST_DAILY, todayStr);
        } catch {
          // ignore
        }
      }
    }

    // Per-habit reminder checks (if enabled)
    if (settings.perHabitReminders) {
      let habitTimesMap: Record<string, string> = {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY_LAST_HABITS);
        if (raw) habitTimesMap = JSON.parse(raw);
      } catch {
        // ignore
      }

      params.habits.forEach((habit) => {
        if (!habit.reminderEnabled || !habit.reminderTime) return;

        const habitTime24 = normalizeTo24Hour(habit.reminderTime);
        if (habitTime24 === currentHHMM) {
          const habitKey = `${habit.id}_${todayStr}`;
          if (habitTimesMap[habitKey]) return; // already sent today

          const status = params.checkInRecords[habit.id]?.[todayStr];
          if (status !== 'done' && status !== 'skipped') {
            this.sendLocalNotification({
              title: `Time for: ${habit.name}`,
              body: `Scheduled ritual for ${formatTo12Hour(habit.reminderTime)}. Take a moment to complete it.`,
              tag: `habit-reminder-${habit.id}-${todayStr}`,
            });

            habitTimesMap[habitKey] = currentHHMM;
            try {
              localStorage.setItem(STORAGE_KEY_LAST_HABITS, JSON.stringify(habitTimesMap));
            } catch {
              // ignore
            }
          }
        }
      });
    }
  }
}
