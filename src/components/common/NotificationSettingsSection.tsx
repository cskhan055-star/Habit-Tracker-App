import React, { useState, useEffect } from 'react';
import { NotificationSettings } from '../../types/habit';
import {
  NotificationService,
  formatTo12Hour,
  normalizeTo24Hour,
} from '../../services/notificationService';

interface NotificationSettingsSectionProps {
  onShowToast: (msg: string) => void;
}

const PRESET_TIMES = [
  { label: 'Morning', time: '08:00', display: '8:00 AM' },
  { label: 'Afternoon', time: '13:00', display: '1:00 PM' },
  { label: 'Evening', time: '20:30', display: '8:30 PM' },
  { label: 'Night', time: '22:00', display: '10:00 PM' },
];

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  onShowToast,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    NotificationService.getSettings()
  );
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setPermission(NotificationService.getPermission());
  }, []);

  const updateSettings = (partial: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    NotificationService.saveSettings(updated);
  };

  const handleToggleEnabled = async () => {
    const nextState = !settings.enabled;
    updateSettings({ enabled: nextState });

    if (nextState && permission === 'default') {
      const res = await NotificationService.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        onShowToast('Notifications enabled and permission granted.');
      } else {
        onShowToast('Reminder enabled. System notifications require browser permission.');
      }
    } else {
      onShowToast(nextState ? 'Daily habit reminders enabled.' : 'Daily reminders paused.');
    }
  };

  const handleRequestPermission = async () => {
    const res = await NotificationService.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      onShowToast('System push notification permission granted.');
    } else if (res === 'denied') {
      onShowToast('Notifications blocked in browser. Please check site permissions.');
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      updateSettings({ dailyReminderTime: normalizeTo24Hour(val) });
      onShowToast(`Daily reminder scheduled for ${formatTo12Hour(val)}.`);
    }
  };

  const handlePresetSelect = (time24: string, label: string) => {
    updateSettings({ dailyReminderTime: time24 });
    onShowToast(`Daily reminder set to ${label} (${formatTo12Hour(time24)}).`);
  };

  const handleTestNotification = async () => {
    if (isTesting) return;
    setIsTesting(true);

    if (permission === 'default') {
      const res = await NotificationService.requestPermission();
      setPermission(res);
    }

    try {
      await NotificationService.triggerTestNotification();
      onShowToast('Test notification dispatched!');
    } catch {
      onShowToast('Unable to dispatch notification.');
    } finally {
      setIsTesting(false);
    }
  };

  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';

  return (
    <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-4.5 space-y-4">
      {/* Header with Icon, Title, and Master Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1C1F24] border border-[#C6A15B]/30 flex items-center justify-center text-[#E9CC8B]">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F3F0E9] block">
                Daily Habit Reminders
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                  settings.enabled
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-[#1F2228] text-[#9C978F] border-[#26282C]'
                }`}
              >
                {settings.enabled ? 'Active' : 'Off'}
              </span>
            </div>
            <span className="text-[10px] text-[#9C978F]">
              Local push notifications at your custom scheduled time
            </span>
          </div>
        </div>

        {/* Master Gold Toggle Switch */}
        <button
          type="button"
          onClick={handleToggleEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            settings.enabled ? 'bg-gold-gradient' : 'bg-[#26282C]'
          }`}
          role="switch"
          aria-checked={settings.enabled}
          title="Toggle Daily Reminders"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0A0B0D] shadow ring-0 transition duration-200 ease-in-out ${
              settings.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-1 border-t border-[#26282C] text-xs">
          {/* Permission Status & Request Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121418] border border-[#26282C]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isGranted
                    ? 'bg-emerald-400'
                    : isDenied
                    ? 'bg-red-400'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-[11px] text-[#D8D3CA]">
                {isGranted
                  ? 'System Push Allowed'
                  : isDenied
                  ? 'System Notifications Blocked'
                  : 'Browser Permission Needed'}
              </span>
            </div>

            {!isGranted && !isDenied && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-2.5 py-1 rounded-lg border border-[#C6A15B]/40 bg-[#1C1F24] hover:bg-[#22262E] text-[10px] font-medium text-[#E9CC8B] transition-colors cursor-pointer"
              >
                Allow Push
              </button>
            )}
          </div>

          {/* User-Defined Reminder Time Picker & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="daily-time-input" className="text-[11px] font-medium text-[#9C978F]">
                Scheduled Time Each Day
              </label>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold text-[#E9CC8B]">
                  {formatTo12Hour(settings.dailyReminderTime)}
                </span>
                <input
                  id="daily-time-input"
                  type="time"
                  value={settings.dailyReminderTime}
                  onChange={handleTimeChange}
                  className="px-2 py-1 rounded-lg bg-[#1C1F24] border border-[#26282C] text-xs text-[#F3F0E9] focus:border-[#C6A15B] outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {PRESET_TIMES.map((preset) => {
                const isSelected = settings.dailyReminderTime === preset.time;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => handlePresetSelect(preset.time, preset.label)}
                    className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gold-gradient text-[#0A0B0D] font-semibold border-transparent shadow-xs'
                        : 'bg-[#1C1F24] text-[#9C978F] border-[#26282C] hover:border-[#E9CC8B]/40 hover:text-[#F3F0E9]'
                    }`}
                  >
                    <span className="block text-[10px] leading-tight">{preset.label}</span>
                    <span className="block text-[9px] opacity-80 mt-0.5">{preset.display}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Preferences Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-[#26282C]">
            {/* Audio Chime Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#F3F0E9] block">Luxury Harmonic Chime</span>
                <span className="text-[10px] text-[#9C978F]">Play a gentle golden bell when notified</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundEnabled ? 'bg-gold-gradient' : 'bg-[#26282C]'
                }`}
                role="switch"
                aria-checked={settings.soundEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0A0B0D] shadow transition duration-200 ease-in-out ${
                    settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pending Habit Count in Notification */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#F3F0E9] block">Streak & Count Insights</span>
                <span className="text-[10px] text-[#9C978F]">Include remaining habits count to protect streak</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ includePendingCount: !settings.includePendingCount })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.includePendingCount ? 'bg-gold-gradient' : 'bg-[#26282C]'
                }`}
                role="switch"
                aria-checked={settings.includePendingCount}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0A0B0D] shadow transition duration-200 ease-in-out ${
                    settings.includePendingCount ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Per-Habit Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#F3F0E9] block">Per-Habit Custom Times</span>
                <span className="text-[10px] text-[#9C978F]">Also trigger specific habits configured in Habit Edit</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ perHabitReminders: !settings.perHabitReminders })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.perHabitReminders ? 'bg-gold-gradient' : 'bg-[#26282C]'
                }`}
                role="switch"
                aria-checked={settings.perHabitReminders}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0A0B0D] shadow transition duration-200 ease-in-out ${
                    settings.perHabitReminders ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test Notification Action */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={isTesting}
              className="w-full py-2 rounded-xl bg-[#1C1F24] hover:bg-[#252932] border border-[#26282C] hover:border-[#C6A15B]/40 text-[#E9CC8B] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{isTesting ? 'Sending Notification...' : 'Send Test Push Notification'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="flex items-center gap-2 text-[10px] text-[#9C978F]/70 pt-1">
        <svg className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Daily reminders maintain habit consistency and protect streak continuity with zero spam.
        </span>
      </div>
    </div>
  );
};
