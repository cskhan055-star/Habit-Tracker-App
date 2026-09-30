import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { getHabitIconComponent } from '../common/Icons';
import { getCategoryById } from '../../data/categories';
import { ConsistencyRing } from '../common/ConsistencyRing';
import { DayActionSheet } from '../common/DayActionSheet';
import {
  calculateHabitStats,
  getMonthlyHeatmapData,
  getHabitDayStatus,
  parseDate,
} from '../../utils/streakEngine';
import { CheckInStatus } from '../../types/habit';

export const HabitDetailScreen: React.FC = () => {
  const {
    habits,
    checkInRecords,
    setCheckInStatus,
    reflections,
    saveReflection,
    deleteReflection,
    selectedHabitId,
    setEditingHabitId,
    setScreen,
    currentDate,
    entitlement,
    openPaywall,
    t,
  } = useHabit();

  // Reference habit
  const habit = habits.find((h) => h.id === selectedHabitId) || habits[0];

  // Calendar month state (default to current month: Sept 2026)
  const defaultDateObj = parseDate(currentDate);
  const defaultYear = defaultDateObj.getFullYear();
  const defaultMonth = defaultDateObj.getMonth();

  const [currentYear, setCurrentYear] = useState<number>(defaultYear);
  const [currentMonth, setCurrentMonth] = useState<number>(defaultMonth);

  // Reflections & Action Sheet state
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [isWritingNote, setIsWritingNote] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');

  // Feature 2: Day Action Sheet for tapping specific calendar cell
  const [actionSheetDate, setActionSheetDate] = useState<string | null>(null);

  if (!habit) {
    return (
      <div className="p-8 text-center bg-[#0A0B0D] text-[#F3F0E9]">
        <p className="text-sm text-[#9C978F] mb-4">No habit selected.</p>
        <button
          onClick={() => setScreen('home')}
          className="px-4 py-2 rounded-xl bg-gold-gradient text-[#0A0B0D] font-medium text-xs cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const IconComp = getHabitIconComponent(habit.icon);
  const stats = calculateHabitStats(habit, checkInRecords, currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const heatmapCells = getMonthlyHeatmapData(habit.id, currentYear, currentMonth, checkInRecords, currentDate);
  const habitReflections = reflections[habit.id] || {};

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    saveReflection(habit.id, selectedDate, noteContent.trim());
    setIsWritingNote(false);
    setNoteContent('');
  };

  const handleDeleteNote = (dateStr: string) => {
    deleteReflection(habit.id, dateStr);
    if (selectedDate === dateStr && isWritingNote) {
      setIsWritingNote(false);
      setNoteContent('');
    }
  };

  const isCurrentMonthView = currentYear === defaultYear && currentMonth === defaultMonth;

  const handlePrevMonth = () => {
    // Feature Gating: Requirement 5:
    // Only render the current month if !fullHeatmapHistory
    if (!entitlement.fullHeatmapHistory) {
      openPaywall({ trigger: 'calendar_history_locked' });
      return;
    }

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!entitlement.fullHeatmapHistory && isCurrentMonthView) {
      openPaywall({ trigger: 'calendar_history_locked' });
      return;
    }

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleEdit = () => {
    setEditingHabitId(habit.id);
    setScreen('add');
  };

  // Format creation string
  const createdDateObj = parseDate(habit.createdAt);
  const createdMonthStr = monthNames[createdDateObj.getMonth()].slice(0, 3);
  const createdYearStr = createdDateObj.getFullYear();

  const currentSheetStatus: CheckInStatus | 'none' = actionSheetDate
    ? getHabitDayStatus(checkInRecords[habit.id], actionSheetDate)
    : 'none';

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#0A0B0D] text-[#F3F0E9] px-6 pt-7 pb-6">
      <div>
        {/* Top App Bar */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => setScreen('home')}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] hover:bg-[#15171B] transition-colors cursor-pointer"
            aria-label="Back to Today"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="text-base font-medium text-[#F3F0E9] tracking-tight">
            Habit Detail
          </h1>

          <button
            onClick={handleEdit}
            className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center text-[#9C978F] hover:text-[#E9CC8B] hover:bg-[#15171B] transition-colors cursor-pointer"
            aria-label="Edit Habit"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </header>

        {/* Habit Profile Card */}
        <div className="flex items-center gap-4 mb-7 p-4 rounded-2xl bg-[#15171B] border border-[#26282C]">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B] shrink-0">
            <IconComp size={24} strokeWidth={1.5} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F3F0E9] truncate leading-tight">
                {habit.name}
              </h2>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: getCategoryById(habit.category).color }}
                title={`Category: ${getCategoryById(habit.category).label}`}
              />
            </div>
            <p className="text-xs text-[#9C978F] flex items-center gap-1.5 mt-1">
              <span className="capitalize">{habit.frequency}</span>
              <span className="text-[#9C978F]/60">·</span>
              <span className="capitalize">{habit.timeOfDay}</span>
              <span className="text-[#9C978F]/60">·</span>
              <span style={{ color: getCategoryById(habit.category).color }} className="font-medium">
                {getCategoryById(habit.category).label}
              </span>
              <span className="text-[#9C978F]/60">·</span>
              <span>Since {createdMonthStr} {createdYearStr}</span>
            </p>
          </div>
        </div>

        {/* FEATURE 1: Four-Metric Stat Block with Dual-Metric (Streak + Consistency Score EMA + Consistency %) */}
        <div className="grid grid-cols-4 rounded-2xl bg-[#15171B] border border-[#26282C] py-4 px-2 mb-7">
          {/* Col 1: Current Streak */}
          <div className="text-center px-1">
            <span className="font-serif text-2xl sm:text-3xl font-normal text-gold-gradient tracking-tight block">
              {stats.currentStreak}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#9C978F] font-normal mt-1 block leading-tight">
              {t('detailCurrentStreak')}
            </span>
          </div>

          {/* Col 2: Smart Consistency Score Ring */}
          <div className="text-center px-1 border-l border-[#26282C] flex flex-col items-center justify-center">
            <ConsistencyRing score={stats.consistencyScore} size={32} strokeWidth={3} />
            <span className="text-[10px] sm:text-[11px] text-[#E9CC8B] font-medium mt-1 block leading-tight">
              {t('consistencyScoreLabel')}
            </span>
          </div>

          {/* Col 3: Longest */}
          <div className="text-center px-1 border-l border-[#26282C]">
            <span className="font-serif text-2xl sm:text-3xl font-normal text-[#F3F0E9] tracking-tight block">
              {stats.longestStreak}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#9C978F] font-normal mt-1 block leading-tight">
              {t('detailLongestStreak')}
            </span>
          </div>

          {/* Col 4: Overall Consistency % (Skipped days excluded from denominator) */}
          <div className="text-center px-1 border-l border-[#26282C]">
            <span className="font-serif text-2xl sm:text-3xl font-normal text-[#F3F0E9] tracking-tight block">
              {stats.consistency}%
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#9C978F] font-normal mt-1 block leading-tight">
              {t('detailConsistency')}
            </span>
          </div>
        </div>

        {/* Monthly Calendar Heatmap Grid */}
        <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-5 mb-6">
          {/* Month Navigation Arrows */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] hover:bg-[#1C1F24] transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="font-serif text-base font-normal text-[#F3F0E9] tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </span>
              {!entitlement.fullHeatmapHistory && (
                <button
                  onClick={() => openPaywall({ trigger: 'calendar_history_locked' })}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[#C6A15B] bg-[#C6A15B]/15 border border-[#C6A15B]/30 hover:bg-[#C6A15B]/25 transition-colors cursor-pointer"
                  title="Upgrade to unlock full historical months"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>History</span>
                </button>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] hover:bg-[#1C1F24] transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Days of week row */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2.5">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className="text-[10px] font-medium text-[#9C978F]/70">
                {day}
              </span>
            ))}
          </div>

          {/* FEATURE 2: 7-column Calendar Heatmap Grid with Distinct Diagonal Hairline Texture for Skipped */}
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapCells.map((cell, idx) => {
              const canInteract = cell.isCurrentMonth && !cell.isFuture;
              const hasReflection = Boolean(habitReflections[cell.dateStr]);
              const isDateSelected = selectedDate === cell.dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canInteract}
                  onClick={() => {
                    if (canInteract) {
                      setSelectedDate(cell.dateStr);
                      // Feature 2: Open Action Sheet to toggle Done / Skipped / Clear
                      setActionSheetDate(cell.dateStr);
                    }
                  }}
                  title={`${cell.dateStr}: ${
                    cell.isCompleted
                      ? 'Completed'
                      : cell.isSkipped
                      ? 'Skipped / Travel Protected'
                      : 'Not completed'
                  }${hasReflection ? ' (Has reflection)' : ''}`}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-medium transition-all cursor-pointer ${
                    cell.isCompleted
                      ? 'bg-[#C6A15B] text-[#0A0B0D] shadow-sm font-semibold'
                      : cell.isSkipped
                      ? 'skipped-diagonal-pattern border'
                      : cell.isFuture
                      ? 'border border-[#26282C] bg-transparent text-[#9C978F]/30 cursor-default'
                      : cell.isCurrentMonth
                      ? 'bg-[#1C1F24] text-[#9C978F] border border-[#26282C] hover:border-[#E9CC8B]/40'
                      : 'bg-transparent text-[#9C978F]/20 border border-transparent cursor-default'
                  } ${cell.isToday ? 'ring-1 ring-[#E9CC8B]' : ''} ${
                    isDateSelected ? 'ring-2 ring-[#E9CC8B] ring-offset-1 ring-offset-[#0A0B0D]' : ''
                  }`}
                >
                  <span className="tabular-nums leading-none">{cell.dayNumber}</span>
                  {hasReflection && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        cell.isCompleted ? 'bg-[#0A0B0D]' : 'bg-[#E9CC8B]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend Showing Solid Gold "Done", Diagonal Hairline "Skipped", and Outlined "Missed" */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#26282C]/60 text-[11px] text-[#9C978F]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#C6A15B]" />
                <span>Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm skipped-diagonal-pattern border" />
                <span>Skipped (Protected)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#1C1F24] border border-[#26282C]" />
                <span>Open / Missed</span>
              </div>
            </div>
            <span className="text-[10px] text-[#9C978F]/60">Tap day to adjust</span>
          </div>
        </div>

        {/* Action Sheet Modal for Selected Heatmap Day */}
        {actionSheetDate && (
          <DayActionSheet
            isOpen={Boolean(actionSheetDate)}
            onClose={() => setActionSheetDate(null)}
            habitName={habit.name}
            dateStr={actionSheetDate}
            currentStatus={currentSheetStatus}
            onSetStatus={(status) => setCheckInStatus(habit.id, actionSheetDate, status)}
          />
        )}

        {/* Daily Reflections & History View */}
        <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-normal text-[#F3F0E9] tracking-tight">
                Daily Reflections
              </h3>
              <p className="text-xs text-[#9C978F] mt-0.5 font-sans">
                Selected date: <span className="text-[#E9CC8B] font-medium">{selectedDate}</span>
              </p>
            </div>

            {!isWritingNote && (
              <button
                type="button"
                onClick={() => {
                  setNoteContent(habitReflections[selectedDate] || '');
                  setIsWritingNote(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#26282C] bg-[#1C1F24] hover:border-[#E9CC8B]/40 text-xs font-medium text-[#E9CC8B] transition-colors cursor-pointer"
              >
                {habitReflections[selectedDate] ? 'Edit Note' : '+ Add Note'}
              </button>
            )}
          </div>

          {/* Note Input Box */}
          {isWritingNote && (
            <div className="mb-4 p-4 rounded-xl bg-[#0A0B0D] border border-[#26282C]">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Record a thought, insight, or reflection on today's practice..."
                rows={3}
                className="w-full bg-transparent text-xs text-[#F3F0E9] placeholder-[#9C978F]/40 outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#1C1F24]">
                <button
                  type="button"
                  onClick={() => setIsWritingNote(false)}
                  className="px-3 py-1 rounded-lg text-xs text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 rounded-lg bg-gold-gradient text-[#0A0B0D] font-medium text-xs cursor-pointer gold-btn-shadow"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          )}

          {/* Reflections List for Habit */}
          {Object.keys(habitReflections).length === 0 ? (
            <div className="py-4 text-center text-xs text-[#9C978F]/70">
              No reflections recorded yet. Tap any date above to record your thoughts.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(habitReflections)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([dateStr, note]) => (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedDate === dateStr
                        ? 'bg-[#1C1F24] border-[#E9CC8B]/40'
                        : 'bg-[#121417] border-[#26282C] hover:border-[#26282C]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-medium text-[#E9CC8B]">
                        {dateStr}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(dateStr);
                        }}
                        className="text-[#9C978F]/50 hover:text-red-400 text-xs transition-colors p-1"
                        title="Delete reflection"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-[#F3F0E9] leading-relaxed font-sans font-light">
                      "{note}"
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
