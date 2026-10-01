import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '../../types/habit';
import { getHabitIconComponent } from './Icons';

interface CompletionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  dateStr: string;
  initialNote?: string;
  onSave: (note: string) => void;
  onDelete?: () => void;
}

const QUICK_TAGS = [
  'Deep focus',
  'Pushed through resistance',
  'Felt effortless',
  'High energy',
  'Milestone reached',
];

export const CompletionNoteModal: React.FC<CompletionNoteModalProps> = ({
  isOpen,
  onClose,
  habit,
  dateStr,
  initialNote = '',
  onSave,
  onDelete,
}) => {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
      // Auto-focus textarea with slight delay for modal mount
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 80);
    }
  }, [isOpen, initialNote]);

  if (!isOpen || !habit) return null;

  const IconComp = getHabitIconComponent(habit.icon);

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  const handleTagClick = (tag: string) => {
    setNote((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return trimmed;
      return `${trimmed} • ${tag}`;
    });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0B0D]/85 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#15171B] border border-[#26282C] shadow-2xl p-6 text-[#F3F0E9] z-10 overflow-hidden">
        {/* Mobile Pull Handle */}
        <div className="w-10 h-1 bg-[#26282C] rounded-full mx-auto -mt-2 mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C1F24] border border-[#C6A15B]/40 flex items-center justify-center text-[#E9CC8B] shrink-0">
              <IconComp size={20} strokeWidth={1.6} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] uppercase tracking-wider text-[#C6A15B] font-medium">
                  {initialNote ? 'Edit Reflection' : 'Check-In Completed'}
                </span>
              </div>
              <h3 className="font-serif text-lg font-normal text-[#F3F0E9] leading-snug">
                {habit.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#26282C] bg-[#1C1F24] flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Subtitle / Context */}
        <p className="text-xs text-[#9C978F] mb-3 leading-relaxed">
          Record a brief thought, milestone, or reflection for{' '}
          <span className="text-[#E9CC8B] font-medium">{dateStr}</span> (optional):
        </p>

        {/* Text Input Area */}
        <div className="relative mb-3">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            maxLength={320}
            placeholder="e.g. Read 20 pages of Meditations. Morning focus was crisp and uninterrupted..."
            className="w-full p-3.5 rounded-2xl bg-[#0A0B0D] border border-[#26282C] focus:border-[#C6A15B]/70 focus:ring-1 focus:ring-[#C6A15B]/30 text-xs text-[#F3F0E9] placeholder-[#9C978F]/40 outline-none resize-none leading-relaxed transition-all"
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-[#9C978F]/40 tabular-nums">
            {note.length}/320
          </span>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2.5 py-1 rounded-lg bg-[#1C1F24] hover:bg-[#252932] border border-[#26282C] text-[10px] text-[#9C978F] hover:text-[#E9CC8B] transition-colors whitespace-nowrap cursor-pointer"
            >
              + {tag}
            </button>
          ))}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#26282C]">
          {initialNote && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="text-xs text-red-400/80 hover:text-red-400 transition-colors cursor-pointer py-2 px-1"
            >
              Delete Note
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer py-2 px-2"
            >
              Skip
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#0A0B0D] font-medium text-xs tracking-wide flex items-center justify-center gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
