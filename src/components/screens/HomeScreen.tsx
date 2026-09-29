import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { FlameIcon, getHabitIconComponent, CrownIcon } from '../common/Icons';
import { BottomNav } from '../common/BottomNav';
import { ThemeSelectorModal } from '../common/ThemeSelectorModal';
import { LanguageSelectorModal } from '../common/LanguageSelectorModal';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { HABIT_CATEGORIES, getCategoryById } from '../../data/categories';
import {
  calculateHabitStats,
  getWeeklyOverview,
  isHabitScheduledOnDate,
  parseDate,
} from '../../utils/streakEngine';

export const HomeScreen: React.FC = () => {
  const {
    habits,
    checkIns,
    currentDate,
    overallStreak,
    todayCheckInRatio,
    toggleCheckIn,
    setSelectedHabitId,
    setScreen,
    isPremium,
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

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  // Filter habits by name and category
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesCategory = !selectedCategory || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const { weekData } = getWeeklyOverview(habits, checkIns, currentDate);

  const handleCheckInClick = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    setAnimatingHabitId(habitId);
    
    // Check if habit is being completed (not uncompleted)
    const habitDates = checkIns[habitId] || [];
    const isAlreadyCompleted = habitDates.includes(currentDate);
    if (!isAlreadyCompleted) {
      setIsStreakShimmering(true);
      setTimeout(() => {
        setIsStreakShimmering(false);
      }, 900);
    }

    toggleCheckIn(habitId, currentDate);
    setTimeout(() => {
      setAnimatingHabitId(null);
    }, 300);
  };

  const handleHabitRowClick = (habitId: string) => {
    setSelectedHabitId(habitId);
    setScreen('detail');
  };

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

          {/* Right actions: Language + Theme + Account + Crown */}
          <div className="flex items-center gap-2">
            {/* Language Selector Button */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="w-10 h-10 rounded-full border border-[#26282C] bg-[#15171B] flex items-center justify-center text-[#F3F0E9] hover:border-[#E9CC8B]/50 transition-colors cursor-pointer"
              title={t('selectLanguage')}
              aria-label={t('selectLanguage')}
            >
              <span className="text-base select-none">{currentLang.flag}</span>
            </button>

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
                isPremium
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

        {/* Hero Streak Card */}
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

        {/* Today's Habits Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[#F3F0E9] text-base font-medium tracking-tight">{t('homeTodaySection')}</h2>
            <span className="text-[#9C978F] text-xs font-normal">
              {t('homeTodayDone', { done: todayCheckInRatio.completed, total: todayCheckInRatio.total })}
            </span>
          </div>

          {/* Border-less Underlined Search Bar */}
          <div className="mb-4">
            <div className="relative flex items-center border-b border-[#26282C] focus-within:border-[#E9CC8B] transition-colors pb-1.5 px-0.5">
              <svg
                className="w-4 h-4 text-[#9C978F] shrink-0 mr-2.5 transition-colors group-focus-within:text-[#E9CC8B]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
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
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
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
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
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
                onClick={() => setScreen('add')}
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
                const habitDates = checkIns[habit.id] || [];
                const isChecked = habitDates.includes(currentDate);
                const habitStats = calculateHabitStats(habit, checkIns, currentDate);
                const IconComponent = getHabitIconComponent(habit.icon);
                const categoryInfo = getCategoryById(habit.category);
                const isAnimating = animatingHabitId === habit.id;

                return (
                  <div
                    key={habit.id}
                    onClick={() => handleHabitRowClick(habit.id)}
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
                          {/* Color-coded Category Dot Indicator */}
                          <span
                            className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: categoryInfo.color }}
                            title={`Category: ${categoryInfo.label}`}
                          />
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
                      </div>
                    </div>

                    {/* Right: Streak Flame + Circular Check-in Ring */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Habit streak count */}
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

                      {/* Circular Check-in Ring Touch Target >= 44x44px */}
                      <button
                        onClick={(e) => handleCheckInClick(e, habit.id)}
                        className="w-11 h-11 flex items-center justify-center cursor-pointer -mr-1"
                        aria-label={`Mark ${habit.name} as ${isChecked ? 'incomplete' : 'completed'}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isChecked
                              ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm'
                              : 'border border-[#26282C] bg-transparent text-transparent hover:border-[#E9CC8B]/50'
                          } ${isAnimating && isChecked ? 'animate-scale-pulse' : ''}`}
                        >
                          {isChecked && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
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
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeScreen="home" />
    </div>
  );
};
