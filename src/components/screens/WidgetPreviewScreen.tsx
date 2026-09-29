import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { FlameIcon, getHabitIconComponent, AurumMark } from '../common/Icons';

type WidgetSize = 'medium' | 'small';

export const WidgetPreviewScreen: React.FC = () => {
  const {
    habits,
    checkIns,
    currentDate,
    overallStreak,
    todayCheckInRatio,
    toggleCheckIn,
    setScreen,
  } = useHabit();

  const [widgetSize, setWidgetSize] = useState<WidgetSize>('medium');
  const [pulseHabitId, setPulseHabitId] = useState<string | null>(null);

  // Top 3 habits for medium widget, or top 1 for small widget
  const topHabits = habits.slice(0, 3);
  const primaryHabit = habits[0];

  const handleWidgetCheckIn = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    setPulseHabitId(habitId);
    toggleCheckIn(habitId, currentDate);
    setTimeout(() => setPulseHabitId(null), 300);
  };

  return (
    <div className="relative min-h-full flex flex-col justify-between bg-[#08080A] text-[#F3F0E9] overflow-hidden select-none">
      {/* Top Preview Controller Bar */}
      <div className="relative z-30 flex items-center justify-between px-5 pt-4 pb-3 bg-[#0A0B0D]/90 backdrop-blur-md border-b border-[#26282C]">
        <button
          onClick={() => setScreen('home')}
          className="flex items-center gap-1.5 text-xs text-[#9C978F] hover:text-[#F3F0E9] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to App</span>
        </button>

        {/* Size Switcher (4x2 vs 2x2) */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#15171B] border border-[#26282C]">
          <button
            onClick={() => setWidgetSize('medium')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              widgetSize === 'medium'
                ? 'bg-gold-gradient text-[#0A0B0D]'
                : 'text-[#9C978F] hover:text-[#F3F0E9]'
            }`}
          >
            Medium 4×2
          </button>
          <button
            onClick={() => setWidgetSize('small')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              widgetSize === 'small'
                ? 'bg-gold-gradient text-[#0A0B0D]'
                : 'text-[#9C978F] hover:text-[#F3F0E9]'
            }`}
          >
            Small 2×2
          </button>
        </div>
      </div>

      {/* Realistic Android Home Screen Simulation */}
      <div className="relative flex-1 flex flex-col justify-between px-6 py-6 overflow-hidden">
        {/* Android Wallpaper ambient gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, #15181F 0%, #0A0B0E 75%, #050607 100%)',
          }}
        />

        {/* Realistic Home Screen Status Bar & Clock */}
        <div className="relative z-10 flex flex-col items-center pt-2 text-center">
          <span className="font-serif text-6xl sm:text-7xl font-light text-[#F3F0E9] tracking-tight">
            9:41
          </span>
          <span className="text-xs text-[#9C978F] font-normal tracking-wide mt-1">
            Thursday, September 24
          </span>
        </div>

        {/* Interactive Aurum Widget in Center */}
        <div className="relative z-10 my-auto py-4 flex justify-center">
          {widgetSize === 'medium' ? (
            /* 4x2 Medium Widget Card */
            <div className="w-full max-w-sm rounded-3xl bg-[#15171B]/95 border border-[#26282C] backdrop-blur-lg p-4 shadow-2xl transition-all duration-300">
              {/* Widget Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#26282C]/60">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B]">
                    <FlameIcon size={12} strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-medium text-[#F3F0E9]">
                    Aurum <span className="text-[#9C978F] font-normal">· {overallStreak} day streak</span>
                  </span>
                </div>

                <span className="text-[11px] font-medium text-[#E9CC8B] tabular-nums">
                  {todayCheckInRatio.completed}/{todayCheckInRatio.total}
                </span>
              </div>

              {/* Top 3 Habits with Instant Check-in */}
              <div className="space-y-2">
                {topHabits.map((habit) => {
                  const habitDates = checkIns[habit.id] || [];
                  const isChecked = habitDates.includes(currentDate);
                  const Icon = getHabitIconComponent(habit.icon);
                  const isPulsing = pulseHabitId === habit.id;

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#1C1F24]/50 border border-[#26282C]/40 hover:bg-[#1C1F24] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#15171B] border border-[#26282C] flex items-center justify-center text-[#E9CC8B] shrink-0">
                          <Icon size={14} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs text-[#F3F0E9] font-medium truncate">
                          {habit.name}
                        </span>
                      </div>

                      {/* Instant Check-in Ring */}
                      <button
                        type="button"
                        onClick={(e) => handleWidgetCheckIn(e, habit.id)}
                        className="w-8 h-8 flex items-center justify-center cursor-pointer -mr-1"
                        aria-label={`Toggle ${habit.name}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isChecked
                              ? 'bg-gold-gradient text-[#0A0B0D]'
                              : 'border border-[#26282C] bg-transparent text-transparent hover:border-[#E9CC8B]/50'
                          } ${isPulsing && isChecked ? 'animate-scale-pulse' : ''}`}
                        >
                          {isChecked && (
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth={3.5}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Sub-bar note */}
              <div className="mt-3 pt-2 flex items-center justify-between text-[10px] text-[#9C978F]/60">
                <span>Tap ring to check in directly</span>
                <span>Aurum Glance</span>
              </div>
            </div>
          ) : (
            /* 2x2 Small Widget Card */
            <div className="w-44 h-44 rounded-3xl bg-[#15171B]/95 border border-[#26282C] backdrop-blur-lg p-4 shadow-2xl flex flex-col justify-between transition-all duration-300">
              <div className="flex items-center justify-between">
                <AurumMark size={20} strokeWidth={1.5} />
                <div className="flex items-center gap-1 text-[#E9CC8B] text-xs">
                  <FlameIcon size={12} strokeWidth={1.8} />
                  <span className="font-semibold tabular-nums">{overallStreak}</span>
                </div>
              </div>

              {primaryHabit && (
                <div className="my-auto">
                  <span className="text-[10px] text-[#9C978F] block mb-0.5">Next Habit</span>
                  <p className="text-xs font-medium text-[#F3F0E9] truncate">
                    {primaryHabit.name}
                  </p>
                </div>
              )}

              {primaryHabit && (
                <div className="flex items-center justify-between pt-2 border-t border-[#26282C]/60">
                  <span className="text-[10px] text-[#9C978F]">Check in</span>
                  <button
                    onClick={(e) => handleWidgetCheckIn(e, primaryHabit.id)}
                    className="cursor-pointer"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        (checkIns[primaryHabit.id] || []).includes(currentDate)
                          ? 'bg-gold-gradient text-[#0A0B0D]'
                          : 'border border-[#26282C] hover:border-[#E9CC8B]/50'
                      } ${pulseHabitId === primaryHabit.id && (checkIns[primaryHabit.id] || []).includes(currentDate) ? 'animate-scale-pulse' : ''}`}
                    >
                      {(checkIns[primaryHabit.id] || []).includes(currentDate) && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ambient App Grid Context & Android Dock Icons */}
        <div className="relative z-10 w-full max-w-sm mx-auto">
          {/* Dock row */}
          <div className="p-3 rounded-3xl bg-[#15171B]/60 border border-[#26282C]/40 backdrop-blur-md flex items-center justify-around">
            {/* Phone */}
            <div className="w-11 h-11 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#9C978F]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            {/* Messages */}
            <div className="w-11 h-11 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#9C978F]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            {/* Aurum App Icon */}
            <button
              onClick={() => setScreen('home')}
              className="w-11 h-11 rounded-2xl bg-[#15171B] border-2 border-[#C6A15B] flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Open Aurum"
            >
              <AurumMark size={22} strokeWidth={1.5} />
            </button>
            {/* Camera */}
            <div className="w-11 h-11 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#9C978F]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>

          {/* Android Gesture Bar */}
          <div className="w-28 h-1 bg-[#F3F0E9]/40 rounded-full mx-auto mt-4" />
        </div>
      </div>
    </div>
  );
};
