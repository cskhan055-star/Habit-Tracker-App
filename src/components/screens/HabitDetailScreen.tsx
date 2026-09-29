import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { getHabitIconComponent } from '../common/Icons';
import { getCategoryById } from '../../data/categories';
import {
  calculateHabitStats,
  getMonthlyHeatmapData,
  parseDate,
} from '../../utils/streakEngine';

export const HabitDetailScreen: React.FC = () => {
  const {
    habits,
    checkIns,
    reflections,
    saveReflection,
    deleteReflection,
    selectedHabitId,
    setSelectedHabitId,
    setEditingHabitId,
    setScreen,
    currentDate,
    toggleCheckIn,
  } = useHabit();

  // Reference habit
  const habit = habits.find((h) => h.id === selectedHabitId) || habits[0];

  // Calendar month state (default to Sept 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 is September (0-indexed)

  // Reflections state
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [isWritingNote, setIsWritingNote] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');

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
  const stats = calculateHabitStats(habit, checkIns, currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const heatmapCells = getMonthlyHeatmapData(habit.id, currentYear, currentMonth, checkIns, currentDate);
  const habitReflections = reflections[habit.id] || {};
  const reflectionEntries = Object.entries(habitReflections).sort((a, b) => b[0].localeCompare(a[0]));

  const formatReflectionDate = (dateStr: string): string => {
    const d = parseDate(dateStr);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleOpenNoteEditor = (dateStr: string = currentDate) => {
    setSelectedDate(dateStr);
    setNoteContent(habitReflections[dateStr] || '');
    setIsWritingNote(true);
  };

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

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
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
            title="Edit habit settings"
            aria-label="Edit habit settings"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </header>

        {/* Habit Summary Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B] shrink-0">
            <IconComp size={24} strokeWidth={1.5} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-normal text-[#F3F0E9] tracking-tight leading-tight">
                {habit.name}
              </h2>
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: getCategoryById(habit.category).color }}
                title={`Category: ${getCategoryById(habit.category).label}`}
              />
            </div>
            <p className="text-xs text-[#9C978F] mt-0.5 flex items-center flex-wrap gap-1">
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

        {/* Three-Column Stat Block */}
        <div className="grid grid-cols-3 rounded-2xl bg-[#15171B] border border-[#26282C] py-5 px-3 mb-7">
          {/* Col 1: Current Streak */}
          <div className="text-center px-1">
            <span className="font-serif text-3xl sm:text-4xl font-normal text-gold-gradient tracking-tight block">
              {stats.currentStreak}
            </span>
            <span className="text-[11px] text-[#9C978F] font-normal mt-1 block">
              Current streak
            </span>
          </div>

          {/* Col 2: Longest */}
          <div className="text-center px-1 border-x border-[#26282C]">
            <span className="font-serif text-3xl sm:text-4xl font-normal text-[#F3F0E9] tracking-tight block">
              {stats.longestStreak}
            </span>
            <span className="text-[11px] text-[#9C978F] font-normal mt-1 block">
              Longest
            </span>
          </div>

          {/* Col 3: Consistency */}
          <div className="text-center px-1">
            <span className="font-serif text-3xl sm:text-4xl font-normal text-[#F3F0E9] tracking-tight block">
              {stats.consistency}%
            </span>
            <span className="text-[11px] text-[#9C978F] font-normal mt-1 block">
              Consistency
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

            <span className="font-serif text-base font-normal text-[#F3F0E9] tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </span>

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

          {/* 7-column Calendar Heatmap Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapCells.map((cell, idx) => {
              // Interactive day toggle for today and past days in current month
              const canToggle = cell.isCurrentMonth && !cell.isFuture;
              const hasReflection = Boolean(habitReflections[cell.dateStr]);
              const isDateSelected = selectedDate === cell.dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canToggle}
                  onClick={() => {
                    if (canToggle) {
                      setSelectedDate(cell.dateStr);
                      toggleCheckIn(habit.id, cell.dateStr);
                    }
                  }}
                  title={`${cell.dateStr}: ${cell.isCompleted ? 'Completed' : 'Not completed'}${
                    hasReflection ? ' (Has reflection)' : ''
                  }`}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-medium transition-all ${
                    cell.isCompleted
                      ? 'bg-[#C6A15B] text-[#0A0B0D] shadow-sm font-semibold'
                      : cell.isFuture
                      ? 'border border-[#26282C] bg-transparent text-[#9C978F]/30'
                      : cell.isCurrentMonth
                      ? 'bg-[#1C1F24] text-[#9C978F] border border-[#26282C] hover:border-[#E9CC8B]/40 cursor-pointer'
                      : 'bg-transparent text-[#9C978F]/20 border border-transparent'
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

          {/* Legend Showing "Less -> More" Opacity Scale */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#26282C]/60 text-[11px] text-[#9C978F]">
            <span>Less</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#1C1F24] border border-[#26282C]" title="None" />
              <span className="w-3.5 h-3.5 rounded-sm bg-[#C6A15B]/30" title="Low" />
              <span className="w-3.5 h-3.5 rounded-sm bg-[#C6A15B]/60" title="Medium" />
              <span className="w-3.5 h-3.5 rounded-sm bg-[#C6A15B]/85" title="High" />
              <span className="w-3.5 h-3.5 rounded-sm bg-[#C6A15B]" title="Complete" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Daily Reflections & History View */}
        <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-normal text-[#F3F0E9] tracking-tight">
                Daily Reflections
              </h3>
              <span className="text-[11px] text-[#9C978F]">
                {reflectionEntries.length} {reflectionEntries.length === 1 ? 'reflection' : 'reflections'} logged
              </span>
            </div>

            {!isWritingNote && (
              <button
                onClick={() => handleOpenNoteEditor(currentDate)}
                className="px-3 py-1.5 rounded-xl border border-[#26282C] bg-[#1C1F24] hover:border-[#E9CC8B]/50 text-xs text-[#E9CC8B] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Write Note</span>
              </button>
            )}
          </div>

          {/* Active Writing / Editing Note Card */}
          {isWritingNote && (
            <div className="p-4 rounded-xl bg-[#1C1F24] border border-[#E9CC8B]/40 mb-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#E9CC8B]">
                  Reflection for {formatReflectionDate(selectedDate)}
                </span>
                <button
                  onClick={() => {
                    setIsWritingNote(false);
                    setNoteContent('');
                  }}
                  className="text-[#9C978F] hover:text-[#F3F0E9] text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Capture your reflection, state of mind, or milestone observations..."
                rows={3}
                maxLength={320}
                className="w-full bg-[#15171B] border border-[#26282C] focus:border-[#E9CC8B] rounded-xl p-3 text-xs sm:text-sm text-[#F3F0E9] placeholder-[#9C978F]/40 outline-none resize-none leading-relaxed transition-colors mb-3"
                autoFocus
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#9C978F]/60">
                  {noteContent.length}/320 characters
                </span>
                <button
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    noteContent.trim()
                      ? 'bg-gold-gradient text-[#0A0B0D] gold-btn-shadow'
                      : 'bg-[#26282C] text-[#9C978F]/40 cursor-not-allowed'
                  }`}
                >
                  Save Reflection
                </button>
              </div>
            </div>
          )}

          {/* History View List */}
          {reflectionEntries.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[#26282C] rounded-xl bg-[#1C1F24]/30">
              <p className="text-xs text-[#9C978F] mb-3 leading-relaxed">
                No reflections recorded yet. Record observations on mindset, focus, or milestones.
              </p>
              <button
                onClick={() => handleOpenNoteEditor(currentDate)}
                className="text-xs text-[#E9CC8B] hover:underline cursor-pointer"
              >
                Write first reflection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reflectionEntries.map(([dateStr, note]) => (
                <div
                  key={dateStr}
                  className="p-3.5 rounded-xl bg-[#1C1F24]/60 border border-[#26282C] hover:border-[#26282C]/90 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-[#E9CC8B]">
                      {formatReflectionDate(dateStr)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenNoteEditor(dateStr)}
                        className="text-[11px] text-[#9C978F] hover:text-[#F3F0E9] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(dateStr)}
                        className="text-[11px] text-rose-400/80 hover:text-rose-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#F3F0E9] font-normal leading-relaxed">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Switch between habits drawer/selector if multiple habits */}
      {habits.length > 1 && (
        <div className="pt-2 pb-1">
          <span className="text-[11px] text-[#9C978F] block mb-2 font-normal">Switch Habit</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {habits.map((h) => {
              const Icon = getHabitIconComponent(h.icon);
              const isSelected = h.id === habit.id;
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHabitId(h.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1F24] border-[#E9CC8B] text-[#E9CC8B]'
                      : 'bg-[#15171B] border-[#26282C] text-[#9C978F] hover:text-[#F3F0E9]'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span>{h.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
