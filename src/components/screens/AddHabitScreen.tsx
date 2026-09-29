import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { AVAILABLE_ICONS } from '../common/Icons';
import { HabitFrequency, HabitCategoryId } from '../../types/habit';
import { HABIT_CATEGORIES } from '../../data/categories';

export const AddHabitScreen: React.FC = () => {
  const {
    habits,
    editingHabitId,
    addHabit,
    updateHabit,
    deleteHabit,
    setScreen,
    setEditingHabitId,
  } = useHabit();

  const existingHabit = editingHabitId ? habits.find((h) => h.id === editingHabitId) : null;

  const [name, setName] = useState(existingHabit ? existingHabit.name : '');
  const [icon, setIcon] = useState(existingHabit ? existingHabit.icon : 'walk');
  const [category, setCategory] = useState<HabitCategoryId>(existingHabit?.category || 'health');
  const [frequency, setFrequency] = useState<HabitFrequency>(
    existingHabit ? existingHabit.frequency : 'daily'
  );
  const [customDays, setCustomDays] = useState<number[]>(
    existingHabit?.customDays || [1, 2, 3, 4, 5] // Mon-Fri default
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    existingHabit ? existingHabit.reminderEnabled : true
  );
  const [reminderTime, setReminderTime] = useState(
    existingHabit ? existingHabit.reminderTime : '7:00 PM'
  );

  const daysLabels = [
    { day: 1, label: 'M' },
    { day: 2, label: 'T' },
    { day: 3, label: 'W' },
    { day: 4, label: 'T' },
    { day: 5, label: 'F' },
    { day: 6, label: 'S' },
    { day: 0, label: 'S' },
  ];

  const toggleDay = (dayIndex: number) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (existingHabit) {
      updateHabit(existingHabit.id, {
        name: name.trim(),
        icon,
        category,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
        reminderEnabled,
        reminderTime,
      });
    } else {
      addHabit({
        name: name.trim(),
        icon,
        category,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
        reminderEnabled,
        reminderTime,
        timeOfDay: frequency === 'daily' ? 'anytime' : 'evening',
      });
    }

    setEditingHabitId(null);
    setScreen('home');
  };

  const handleDelete = () => {
    if (existingHabit) {
      deleteHabit(existingHabit.id);
      setEditingHabitId(null);
      setScreen('home');
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#0A0B0D] text-[#F3F0E9] px-6 pt-7 pb-6">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              setEditingHabitId(null);
              setScreen('home');
            }}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] hover:bg-[#15171B] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="text-base font-medium text-[#F3F0E9] tracking-tight">
            {existingHabit ? 'Edit Habit' : 'New Habit'}
          </h1>

          <div className="w-10" />
        </div>

        {/* 1. Habit Name (Editorial Underlined Input) */}
        <div className="mb-8">
          <label className="text-xs font-normal text-[#9C978F] block mb-2 tracking-wide">
            Habit name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Evening Walk"
            maxLength={40}
            className="w-full bg-transparent border-b border-[#26282C] focus:border-[#E9CC8B] py-2 text-xl font-normal text-[#F3F0E9] placeholder-[#9C978F]/40 outline-none transition-colors"
            autoFocus
          />
        </div>

        {/* 2. Category Selector */}
        <div className="mb-8">
          <label className="text-xs font-normal text-[#9C978F] block mb-3 tracking-wide">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {HABIT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#1C1F24] border-[#E9CC8B] text-[#F3F0E9] ring-1 ring-[#E9CC8B]/40'
                      : 'bg-[#15171B] border-[#26282C] text-[#9C978F] hover:text-[#F3F0E9] hover:border-[#26282C]/90'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Icon Picker (Horizontal scroll of 13+ linework icons) */}
        <div className="mb-8">
          <label className="text-xs font-normal text-[#9C978F] block mb-3 tracking-wide">
            Icon
          </label>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {AVAILABLE_ICONS.map((item) => {
              const IconComp = item.component;
              const isSelected = icon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  title={item.label}
                  className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1F24] border-2 border-[#E9CC8B] text-[#E9CC8B] shadow-sm'
                      : 'bg-[#15171B] border border-[#26282C] text-[#9C978F] hover:text-[#F3F0E9] hover:border-[#26282C]/80'
                  }`}
                >
                  <IconComp size={20} strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Frequency Selector (3 Pills) */}
        <div className="mb-7">
          <label className="text-xs font-normal text-[#9C978F] block mb-3 tracking-wide">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2.5 p-1 rounded-2xl bg-[#15171B] border border-[#26282C]">
            {(['daily', 'weekly', 'custom'] as HabitFrequency[]).map((freq) => {
              const isSelected = frequency === freq;
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`h-11 rounded-xl text-xs font-medium capitalize tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm'
                      : 'text-[#9C978F] hover:text-[#F3F0E9]'
                  }`}
                >
                  {freq}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Day-of-week circular selectors (Shown when Custom) */}
        {frequency === 'custom' && (
          <div className="mb-7 transition-all duration-300">
            <label className="text-xs font-normal text-[#9C978F] block mb-3 tracking-wide">
              Scheduled Days
            </label>
            <div className="flex items-center justify-between">
              {daysLabels.map((d, index) => {
                const isSelected = customDays.includes(d.day);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gold-gradient text-[#0A0B0D]'
                        : 'bg-[#15171B] border border-[#26282C] text-[#9C978F] hover:border-[#E9CC8B]/40'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Reminder Time Row with Gold Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#15171B] border border-[#26282C] mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-[#F3F0E9] block">Reminder</span>
              <span className="text-xs text-[#9C978F]">Notify at scheduled time</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {reminderEnabled && (
              <input
                type="text"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-20 text-center py-1 text-xs text-[#E9CC8B] bg-[#1C1F24] border border-[#26282C] rounded-lg outline-none"
              />
            )}

            {/* Custom Gold Toggle Switch */}
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                reminderEnabled ? 'bg-gold-gradient' : 'bg-[#26282C]'
              }`}
              role="switch"
              aria-checked={reminderEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0A0B0D] shadow ring-0 transition duration-200 ease-in-out ${
                  reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Bottom CTAs */}
      <div className="space-y-3 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isFormValid}
          className={`w-full h-13 rounded-2xl font-medium text-sm tracking-wide flex items-center justify-center transition-all ${
            isFormValid
              ? 'bg-gold-gradient text-[#0A0B0D] gold-btn-shadow hover:brightness-105 active:scale-[0.98] cursor-pointer'
              : 'bg-[#1C1F24] text-[#9C978F]/40 border border-[#26282C] cursor-not-allowed'
          }`}
        >
          {existingHabit ? 'Save Changes' : 'Create Habit'}
        </button>

        {existingHabit && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-2.5 text-xs text-rose-400 hover:text-rose-300 font-normal transition-colors cursor-pointer"
          >
            Delete Habit
          </button>
        )}
      </div>
    </div>
  );
};
