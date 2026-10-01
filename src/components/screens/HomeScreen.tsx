import React, { useState, useRef } from 'react';
import { useHabit } from '../../context/HabitContext';
import { FlameIcon, getHabitIconComponent, CrownIcon } from '../common/Icons';
import { BottomNav } from '../common/BottomNav';
import { ThemeSelectorModal } from '../common/ThemeSelectorModal';
import { LanguageSelectorModal } from '../common/LanguageSelectorModal';
import { ConsistencyRing } from '../common/ConsistencyRing';
import { DayActionSheet } from '../common/DayActionSheet';
import { CompletionNoteModal } from '../common/CompletionNoteModal';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { HABIT_CATEGORIES, getCategoryById } from '../../data/categories';
import {
  calculateHabitStats,
  getWeeklyOverview,
  isHabitScheduledOnDate,
  getHabitDayStatus,
  parseDate,
} from '../../utils/streakEngine';
import { CheckInStatus, Habit } from '../../types/habit';

export const HomeScreen: React.FC = () => {
  const {
    habits,
    checkInRecords,
    reflections,
    saveReflection,
    deleteReflection,
    currentDate,
    overallStreak,
    todayCheckInRatio,
    toggleCheckIn,
    setCheckInStatus,
    homeViewMode,
    setHomeViewMode,
    setSelectedHabitId,
    setScreen,
    entitlement,
    openPaywall,
    user,
    locale,
    t,
  } = useHabit();

  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);
  const [isStreakShimmering, setIsStreakShimmering] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Optional Completion Note modal state
  const [completionModalHabit, setCompletionModalHabit] = useState<Habit | null>(null);
  const [completionModalDate, setCompletionModalDate] = useState<string>(currentDate);

  // Feature 2: Action sheet for Skip / Excused day selection via long-press
  const [actionSheetHabitId, setActionSheetHabitId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  // Filter habits by name and category
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesCategory = !selectedCategory || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { weekData } = getWeeklyOverview(habits, checkInRecords, currentDate);

  const handleCheckInClick = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    setAnimatingHabitId(habitId);

    const targetHabit = habits.find((h) => h.id === habitId);
    // Check if habit is being completed (not uncompleted)
    const currentStatus = getHabitDayStatus(checkInRecords[habitId], currentDate);
    const isNowCompleting = currentStatus !== 'done';

    if (isNowCompleting) {
      setIsStreakShimmering(true);
      setTimeout(() => {
        setIsStreakShimmering(false);
      }, 900);

      // Open the optional completion note prompt
      if (targetHabit) {
        setCompletionModalHabit(targetHabit);
        setCompletionModalDate(currentDate);
      }
    }

    toggleCheckIn(habitId, currentDate);
    setTimeout(() => {
      setAnimatingHabitId(null);
    }, 300);
  };

  const handleHabitRowClick = (habitId: string) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    setSelectedHabitId(habitId);
    setScreen('detail');
  };

  // Long press handler for Feature 2: Skip Day
  const handleTouchStart = (habitId: string) => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setActionSheetHabitId(habitId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Feature 3 Focus Mode:
  // Determine incomplete habits for today, ordered by earliest reminderTime, fallback to creation order
  const todayDateObj = parseDate(currentDate);
  const scheduledTodayHabits = habits.filter((h) => isHabitScheduledOnDate(h, todayDateObj));

  const incompleteTodayHabits = scheduledTodayHabits.filter((h) => {
    const status = getHabitDayStatus(checkInRecords[h.id], currentDate);
    return status !== 'done' && status !== 'skipped';
  });

  // Sort incomplete by reminderTime (e.g. "06:15 AM", "10:00 AM", "8:30 PM", fallback creation order)
  const parseReminderMinutes = (timeStr?: string): number => {
    if (!timeStr) return 99999;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 99999;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = (match[3] || '').toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const sortedIncompleteHabits = [...incompleteTodayHabits].sort((a, b) => {
    const timeA = parseReminderMinutes(a.reminderTime);
    const timeB = parseReminderMinutes(b.reminderTime);
    if (timeA !== timeB) return timeA - timeB;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const nextFocusHabit = sortedIncompleteHabits[0] || scheduledTodayHabits[0] || null;
  const remainingIncompleteCount = Math.max(0, incompleteTodayHabits.length - 1);

  // Selected habit for action sheet
  const actionHabit = habits.find((h) => h.id === actionSheetHabitId);
  const actionHabitStatus: CheckInStatus | 'none' = actionSheetHabitId
    ? getHabitDayStatus(checkInRecords[actionSheetHabitId], currentDate)
    : 'none';

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#0A0B0D] text-[#F3F0E9]">
      <div className="px-6 pt-7 pb-4">
        {/* Top Greeting Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[#9C978F] text-xs font-normal tracking-wide block">
              Thursday, 24 September
            </span>
            <h1 className="font-serif text-2xl font-normal text-[#F3F0E9] mt-0.5 tracking-tight">
              {t('homeGreetingEvening')}
            </h1>
          </div>

          {/* Right actions: Focus/List Toggle + Language + Theme + Account + Crown */}
          <div className="flex items-center gap-2">
            {/* Feature 3: Focus Mode Toggle Icon Button */}
            <button
              onClick={() => setHomeViewMode(homeViewMode === 'list' ? 'focus' : 'list')}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                homeViewMode === 'focus'
                  ? 'bg-gold-gradient text-[#0A0B0D] border-transparent shadow-xs'
                  : 'border-[#26282C] bg-[#15171B] text-[#9C978F] hover:text-[#E9CC8B] hover:border-[#E9CC8B]/40'
              }`}
              title={homeViewMode === 'focus' ? 'Switch to List View' : 'Switch to Focus Mode'}
              aria-label={homeViewMode === 'focus' ? 'Switch to List View' : 'Switch to Focus Mode'}
            >
              {homeViewMode === 'focus' ? (
                // Target / Single card focus icon
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
              ) : (
                // Focus crosshair icon
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <circle cx="12" cy="12" r="7" />
                  <line x1="12" y1="1" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="23" />
                  <line x1="1" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="23" y2="12" />
                </svg>
              )}
            </button>

            {/* Language Selector Button */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="w-10 h-10 rounded-full border border-[#26282C] bg-[#15171B] flex items-center justify-center text-[#F3F0E9] hover:border-[#E9CC8B]/50 transition-colors cursor-pointer"
              title={t('selectLanguage')}
              aria-label={t('selectLanguage')}
            >
              <span className="text-base select-none">{currentLang.flag}</span>
            </button>

            {/* Theme Selector Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="w-10 h-10 rounded-full border border-[#26282C] bg-[#15171B] flex items-center justify-center text-[#9C978F] hover:text-[#E9CC8B] hover:border-[#E9CC8B]/40 transition-colors cursor-pointer"
              title="Select Luxury Theme Preset"
              aria-label="Select Luxury Theme Preset"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9" />
                <circle cx="12" cy="6.5" r=".75" fill="currentColor" />
                <circle cx="12" cy="15.5" r=".75" fill="currentColor" />
              </svg>
            </button>

            {/* Account & Profile Button */}
            <button
              onClick={() => setScreen('account')}
              className="w-10 h-10 rounded-full border border-[#26282C] bg-[#15171B] flex items-center justify-center text-[#9C978F] hover:text-[#E9CC8B] hover:border-[#E9CC8B]/40 transition-colors cursor-pointer relative"
              title="Account & Security"
              aria-label="Account & Security"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user.isLoggedIn && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Right crown / membership affordance */}
            <button
              onClick={() => setScreen('paywall')}
              className={`w-10 h-10 rounded-full border border-[#26282C] flex items-center justify-center cursor-pointer transition-colors ${
                entitlement.isGold
                  ? 'bg-gold-gradient text-[#0A0B0D] border-transparent'
                  : 'bg-[#15171B] text-[#E9CC8B] hover:border-[#E9CC8B]/40'
              }`}
              title="Aurum Membership"
              aria-label="Aurum Membership"
            >
              <CrownIcon size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Theme Selector Modal */}
        <ThemeSelectorModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />

        {/* Language Selector Modal */}
        <LanguageSelectorModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />

        {/* Day Action Sheet for Long-press Skip / Travel protection */}
        {actionHabit && (
          <DayActionSheet
            isOpen={Boolean(actionSheetHabitId)}
            onClose={() => setActionSheetHabitId(null)}
            habitName={actionHabit.name}
            habitId={actionHabit.id}
            dateStr={currentDate}
            currentStatus={actionHabitStatus}
            onSetStatus={(status) => setCheckInStatus(actionHabit.id, currentDate, status)}
          />
        )}

        {/* Hero Streak Card (EXACT SAME in both List and Focus mode) */}
        <section className="relative overflow-hidden rounded-2xl bg-[#15171B] border border-[#26282C] p-5 mb-7">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[#9C978F] text-xs font-normal tracking-wide">
                {t('homeStreakLabel')}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  key={isStreakShimmering ? 'shimmer-active' : 'shimmer-idle'}
                  className={`font-serif text-4xl sm:text-5xl font-normal tracking-tight transition-transform duration-300 ${
                    isStreakShimmering
                      ? 'animate-gold-shimmer'
                      : 'text-gold-gradient'
                  }`}
                >
                  {overallStreak}
                </span>
                <span className="text-[#9C978F] text-sm font-normal">{t('homeDays')}</span>
              </div>
            </div>

            {/* Flame Icon Pill */}
            <div className="w-10 h-10 rounded-xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B]">
              <FlameIcon size={20} strokeWidth={1.6} />
            </div>
          </div>

          {/* 7-Day Segmented Progress Bar */}
          <div className="mt-5 pt-4 border-t border-[#26282C]/60">
            <div className="flex items-center gap-1.5 w-full">
              {weekData.map((day, idx) => {
                const isFullyDone = day.completedHabits > 0 && day.completedHabits >= day.scheduledHabits;
                const isPartiallyDone = day.completedHabits > 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1.5"
                    title={`${day.label}: ${day.completedHabits}/${day.scheduledHabits} completed`}
                  >
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        isFullyDone
                          ? 'bg-gold-gradient'
                          : isPartiallyDone
                          ? 'bg-[#C6A15B]/50'
                          : day.isFuture
                          ? 'bg-[#26282C]/40'
                          : 'bg-[#26282C]'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium ${
                        day.isToday ? 'text-[#E9CC8B]' : 'text-[#9C978F]/70'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FEATURE 3: FOCUS MODE VIEW vs FULL LIST VIEW                  */}
        {/* ============================================================== */}
        {homeViewMode === 'focus' ? (
          <section className="mb-6 animate-in fade-in zoom-in-98 duration-200">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E9CC8B]" />
                <h2 className="text-[#F3F0E9] text-base font-medium tracking-tight">
                  Focus Commitment
                </h2>
              </div>
              <span className="text-[11px] text-[#9C978F] font-normal">
                {todayCheckInRatio.completed} of {todayCheckInRatio.total} done
              </span>
            </div>

            {nextFocusHabit ? (() => {
              const habit = nextFocusHabit;
              const status = getHabitDayStatus(checkInRecords[habit.id], currentDate);
              const isChecked = status === 'done';
              const isSkipped = status === 'skipped';
              const habitStats = calculateHabitStats(habit, checkInRecords, currentDate);
              const IconComponent = getHabitIconComponent(habit.icon);
              const categoryInfo = getCategoryById(habit.category);
              const isAnimating = animatingHabitId === habit.id;

              return (
                <div>
                  {/* Single Large Focus Card */}
                  <div
                    onClick={() => handleHabitRowClick(habit.id)}
                    onMouseDown={() => handleTouchStart(habit.id)}
                    onMouseUp={handleTouchEnd}
                    onTouchStart={() => handleTouchStart(habit.id)}
                    onTouchEnd={handleTouchEnd}
                    className="relative overflow-hidden p-6 rounded-3xl bg-[#15171B] border border-[#26282C] hover:border-[#C6A15B]/50 transition-all cursor-pointer group shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B] shrink-0">
                          <IconComponent size={26} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: categoryInfo.color }}
                            />
                            <span className="text-xs uppercase tracking-wider text-[#9C978F]">
                              {categoryInfo.label}
                            </span>
                          </div>
                          <h3 className="text-[#F3F0E9] font-serif text-xl sm:text-2xl font-normal mt-0.5 leading-snug">
                            {habit.name}
                          </h3>
                        </div>
                      </div>

                      {/* Top Right Consistency Score Ring & Streak */}
                      <div className="flex flex-col items-end gap-1">
                        <ConsistencyRing score={habitStats.consistencyScore} size={36} strokeWidth={3.5} />
                        <span className="text-[10px] text-[#9C978F] font-mono tracking-tighter">
                          Score
                        </span>
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="mt-5 pt-4 border-t border-[#26282C]/60 flex items-center justify-between text-xs text-[#9C978F]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FlameIcon size={14} className="text-[#E9CC8B]" />
                          <strong className="text-[#F3F0E9] font-medium">{habitStats.currentStreak}</strong> days
                        </span>
                        <span>·</span>
                        <span>{habit.reminderTime || habit.timeOfDay}</span>
                      </div>

                      {isSkipped && (
                        <span className="px-2 py-0.5 rounded-full skipped-diagonal-pattern border text-[10px] text-[#E9CC8B] font-medium">
                          Excused Today
                        </span>
                      )}
                    </div>

                    {/* Bottom Big Action Touch Target */}
                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleCheckInClick(e, habit.id)}
                        className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm font-semibold'
                            : isSkipped
                            ? 'skipped-diagonal-pattern border text-[#E9CC8B]'
                            : 'bg-[#1C1F24] border border-[#26282C] text-[#F3F0E9] hover:border-[#E9CC8B]/50'
                        } ${isAnimating && isChecked ? 'animate-scale-pulse' : ''}`}
                      >
                        {isChecked ? (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Completed Today</span>
                          </>
                        ) : isSkipped ? (
                          <span>Excused (Travel Protected)</span>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full border border-[#9C978F]/60" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionSheetHabitId(habit.id);
                        }}
                        className="w-12 h-12 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#9C978F] hover:text-[#E9CC8B] transition-colors cursor-pointer"
                        title="Mark as skipped / travel protected"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </button>
                    </div>

                    {/* Focus Mode Daily Reflection Note Display / Add Note trigger */}
                    {(() => {
                      const todayNote = reflections[habit.id]?.[currentDate];
                      if (todayNote) {
                        return (
                          <div className="mt-4 p-3 rounded-2xl bg-[#1C1F24] border border-[#26282C] text-xs text-[#F3F0E9] flex items-start justify-between gap-3 text-left">
                            <div className="flex items-start gap-2.5 overflow-hidden">
                              <span className="text-[#E9CC8B] text-base leading-none select-none font-serif">“</span>
                              <p className="italic text-[#F3F0E9]/90 font-light text-xs leading-relaxed line-clamp-2">
                                {todayNote}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCompletionModalHabit(habit);
                                setCompletionModalDate(currentDate);
                              }}
                              className="text-[11px] text-[#E9CC8B] hover:underline shrink-0 ml-1 cursor-pointer font-medium"
                            >
                              Edit Note
                            </button>
                          </div>
                        );
                      }
                      if (isChecked) {
                        return (
                          <div className="mt-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setCompletionModalHabit(habit);
                                setCompletionModalDate(currentDate);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-[#9C978F] hover:text-[#E9CC8B] transition-colors cursor-pointer py-1"
                            >
                              <svg className="w-3.5 h-3.5 text-[#C6A15B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                              <span>Add a reflection on today's practice...</span>
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Below card hint: "X more today", tappable to expand back to List view */}
                  <div className="mt-4 text-center">
                    {remainingIncompleteCount > 0 ? (
                      <button
                        onClick={() => setHomeViewMode('list')}
                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#15171B] border border-[#26282C] text-xs text-[#9C978F] hover:text-[#E9CC8B] hover:border-[#E9CC8B]/40 transition-colors cursor-pointer"
                      >
                        <span>
                          {t('homeMoreToday', { count: remainingIncompleteCount })}
                        </span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    ) : (
                      <p className="text-xs text-[#9C978F] py-2">
                        {t('homeAllDoneToday')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="rounded-3xl border border-[#26282C] p-8 text-center bg-[#15171B]">
                <p className="text-[#9C978F] text-sm">
                  {t('homeAllDoneToday')}
                </p>
                <button
                  onClick={() => setHomeViewMode('list')}
                  className="mt-3 text-xs text-[#E9CC8B] hover:underline cursor-pointer"
                >
                  View full list
                </button>
              </div>
            )}
          </section>
        ) : (
          /* ============================================================== */
          /* STANDARD FULL LIST VIEW                                       */
          /* ============================================================== */
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[#F3F0E9] text-base font-medium tracking-tight">
                {t('homeTodaySection')}
              </h2>
              <span className="text-[#9C978F] text-xs font-normal">
                {t('homeTodayDone', { done: todayCheckInRatio.completed, total: todayCheckInRatio.total })}
              </span>
            </div>

            {/* Search Input Box */}
            <div className="mb-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#15171B] border border-[#26282C] focus-within:border-[#C6A15B] transition-colors">
                <svg
                  className="w-4 h-4 text-[#9C978F]/60 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchHabits')}
                  className="w-full bg-transparent text-xs sm:text-sm text-[#F3F0E9] placeholder-[#9C978F]/40 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#9C978F] hover:text-[#F3F0E9] text-xs px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  !selectedCategory
                    ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm font-semibold'
                    : 'bg-[#15171B] border border-[#26282C] text-[#9C978F] hover:text-[#F3F0E9]'
                }`}
              >
                {t('allCategories')}
              </button>
              {HABIT_CATEGORIES.map((cat) => {
                const isCatActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isCatActive ? null : cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCatActive
                        ? 'bg-[#1C1F24] border border-[#E9CC8B] text-[#F3F0E9] ring-1 ring-[#E9CC8B]/30'
                        : 'bg-[#15171B] border border-[#26282C] text-[#9C978F] hover:text-[#F3F0E9]'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 border-[1.5px] bg-transparent"
                      style={{ borderColor: cat.color }}
                    />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Habit List */}
            {habits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#26282C] p-8 text-center bg-[#15171B]/40 my-4">
                <p className="text-[#9C978F] text-sm mb-4 leading-relaxed">
                  No habits established yet. Discipline begins with a single commitment.
                </p>
                <button
                  onClick={() => {
                    if (habits.length >= entitlement.maxHabits) {
                      openPaywall({ trigger: 'habit_limit_reached' });
                    } else {
                      setScreen('add');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#0A0B0D] font-medium text-xs tracking-wide cursor-pointer gold-btn-shadow"
                >
                  Create your first habit
                </button>
              </div>
            ) : filteredHabits.length === 0 ? (
              <div className="rounded-2xl border border-[#26282C] p-6 text-center bg-[#15171B]/30 my-3">
                <p className="text-xs text-[#9C978F] mb-3">
                  No habits matching filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="text-xs text-[#E9CC8B] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHabits.map((habit) => {
                  const status = getHabitDayStatus(checkInRecords[habit.id], currentDate);
                  const isChecked = status === 'done';
                  const isSkipped = status === 'skipped';
                  const habitStats = calculateHabitStats(habit, checkInRecords, currentDate);
                  const IconComponent = getHabitIconComponent(habit.icon);
                  const categoryInfo = getCategoryById(habit.category);
                  const isAnimating = animatingHabitId === habit.id;

                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleHabitRowClick(habit.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setActionSheetHabitId(habit.id);
                      }}
                      onMouseDown={() => handleTouchStart(habit.id)}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                      onTouchStart={() => handleTouchStart(habit.id)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90 hover:bg-[#181B20] transition-all cursor-pointer active:scale-[0.99]"
                    >
                      {/* Left: Icon in rounded square */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B] shrink-0">
                          <IconComponent size={19} strokeWidth={1.5} />
                        </div>

                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[#F3F0E9] text-[15px] font-medium truncate leading-snug">
                              {habit.name}
                            </h3>
                            {/* Thin colored outline ring only (1.5px stroke, no fill) */}
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 border-[1.5px] bg-transparent"
                              style={{ borderColor: categoryInfo.color }}
                              title={`Category: ${categoryInfo.label}`}
                            />
                            {/* Skipped Badge if protected today */}
                            {isSkipped && (
                              <span className="px-1.5 py-0.5 text-[9px] rounded-md skipped-diagonal-pattern border text-[#E9CC8B] font-medium leading-none">
                                Excused
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#9C978F] mt-0.5">
                            <span className="capitalize">{habit.frequency}</span>
                            <span className="text-[#9C978F]/60">·</span>
                            <span className="truncate">{habit.timeOfDay}</span>
                            <span className="text-[#9C978F]/60">·</span>
                            <span className="text-[11px] font-medium" style={{ color: categoryInfo.color }}>
                              {categoryInfo.label}
                            </span>
                          </div>

                          {/* Daily Reflection Note snippet for today */}
                          {(() => {
                            const todayNote = reflections[habit.id]?.[currentDate];
                            if (todayNote) {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCompletionModalHabit(habit);
                                    setCompletionModalDate(currentDate);
                                  }}
                                  className="mt-1 flex items-center gap-1.5 text-left text-xs text-[#E9CC8B] hover:text-[#F3F0E9] transition-colors cursor-pointer group"
                                  title="Edit today's reflection note"
                                >
                                  <svg className="w-3 h-3 text-[#C6A15B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                  </svg>
                                  <span className="truncate max-w-[170px] sm:max-w-[240px] italic font-light text-[11px] text-[#F3F0E9]/90">
                                    “{todayNote}”
                                  </span>
                                  <span className="text-[10px] text-[#9C978F] group-hover:underline ml-0.5 shrink-0">
                                    Edit
                                  </span>
                                </button>
                              );
                            }
                            if (isChecked) {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCompletionModalHabit(habit);
                                    setCompletionModalDate(currentDate);
                                  }}
                                  className="mt-1 text-[10px] text-[#9C978F]/60 hover:text-[#E9CC8B] transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Add reflection note for today"
                                >
                                  <svg className="w-2.5 h-2.5 text-[#C6A15B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  <span>Add note</span>
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {/* Right: Dual-Metric System (Streak + Consistency Ring) + Circular Check-in Ring */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* FEATURE 1: Dual-Metric Display */}
                        <div className="flex items-center gap-2 text-right">
                          {/* 1. Raw emotional current streak */}
                          <div className="flex items-center gap-1 text-[#9C978F] text-xs">
                            <FlameIcon
                              size={13}
                              strokeWidth={1.6}
                              className={habitStats.currentStreak > 0 ? 'text-[#E9CC8B]' : 'text-[#9C978F]/60'}
                            />
                            <span className="tabular-nums font-medium text-[13px]">
                              {habitStats.currentStreak}
                            </span>
                          </div>

                          {/* 2. Secondary Consistency Score Ring */}
                          <div className="hidden sm:block">
                            <ConsistencyRing score={habitStats.consistencyScore} size={28} strokeWidth={3} />
                          </div>
                        </div>

                        {/* Circular Check-in Ring Touch Target >= 44x44px */}
                        <button
                          onClick={(e) => handleCheckInClick(e, habit.id)}
                          className="w-11 h-11 flex items-center justify-center cursor-pointer -mr-1"
                          aria-label={`Mark ${habit.name} as ${isChecked ? 'incomplete' : 'completed'}`}
                          title={isSkipped ? 'Excused day (long-press to change)' : 'Tap to complete, long-press to excuse'}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isChecked
                                ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm'
                                : isSkipped
                                ? 'skipped-diagonal-pattern border'
                                : 'border border-[#26282C] bg-transparent text-transparent hover:border-[#E9CC8B]/50'
                            } ${isAnimating && isChecked ? 'animate-scale-pulse' : ''}`}
                          >
                            {isChecked && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {isSkipped && (
                              <svg className="w-3 h-3 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeScreen="home" />

      {/* Optional Completion Note Modal */}
      <CompletionNoteModal
        isOpen={Boolean(completionModalHabit)}
        onClose={() => setCompletionModalHabit(null)}
        habit={completionModalHabit}
        dateStr={completionModalDate}
        initialNote={
          completionModalHabit
            ? (reflections[completionModalHabit.id]?.[completionModalDate] || '')
            : ''
        }
        onSave={(note) => {
          if (completionModalHabit) {
            if (note) {
              saveReflection(completionModalHabit.id, completionModalDate, note);
            } else {
              deleteReflection(completionModalHabit.id, completionModalDate);
            }
          }
        }}
        onDelete={() => {
          if (completionModalHabit) {
            deleteReflection(completionModalHabit.id, completionModalDate);
          }
        }}
      />
    </div>
  );
};
