import React from 'react';
import { CheckInStatus } from '../../types/habit';

interface DayActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  dateStr: string;
  currentStatus: CheckInStatus | 'none';
  onSetStatus: (status: CheckInStatus | 'none') => void;
}

export const DayActionSheet: React.FC<DayActionSheetProps> = ({
  isOpen,
  onClose,
  habitName,
  dateStr,
  currentStatus,
  onSetStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0B0D]/85 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#15171B] border border-[#26282C] shadow-2xl p-6 text-[#F3F0E9] z-10">
        {/* Pull Indicator */}
        <div className="w-10 h-1 bg-[#26282C] rounded-full mx-auto -mt-2 mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#C6A15B] font-medium">
              Day Status & Travel Protection
            </span>
            <h3 className="font-serif text-lg font-normal text-[#F3F0E9] leading-snug mt-0.5">
              {habitName}
            </h3>
            <p className="text-xs text-[#9C978F] mt-0.5 font-sans">
              Date: <span className="text-[#F3F0E9]">{dateStr}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#26282C] bg-[#1C1F24] flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Informative Note */}
        <div className="mb-5 p-3 rounded-xl bg-[#1C1F24]/80 border border-[#26282C] text-xs text-[#9C978F] leading-relaxed">
          <p className="flex items-center gap-1.5 text-[#E9CC8B] font-medium mb-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Streak Travel Protection
          </p>
          Skipping protects your streak and consistency score during travel, illness, or planned rest days without penalty.
        </div>

        {/* Actions List */}
        <div className="space-y-2.5">
          {/* 1. Mark as Skipped / Travel Protected */}
          <button
            type="button"
            onClick={() => {
              onSetStatus('skipped');
              onClose();
            }}
            className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              currentStatus === 'skipped'
                ? 'skipped-diagonal-pattern border font-semibold ring-1 ring-[#C6A15B]/50'
                : 'bg-[#1C1F24] border border-[#26282C] hover:border-[#C6A15B]/40 hover:bg-[#20242B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg skipped-diagonal-pattern border flex items-center justify-center text-[#E9CC8B] shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-[#F3F0E9] block leading-tight">
                  Mark as skipped (Protected)
                </span>
                <span className="text-[11px] text-[#9C978F]">Travel, illness, planned rest</span>
              </div>
            </div>

            {currentStatus === 'skipped' && (
              <span className="text-xs text-[#E9CC8B] font-semibold">Active</span>
            )}
          </button>

          {/* 2. Mark as Completed (Done) */}
          <button
            type="button"
            onClick={() => {
              onSetStatus('done');
              onClose();
            }}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              currentStatus === 'done'
                ? 'bg-gold-gradient text-[#0A0B0D] font-semibold'
                : 'bg-[#1C1F24] border border-[#26282C] hover:border-[#E9CC8B]/40 hover:bg-[#20242B] text-[#F3F0E9]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentStatus === 'done' ? 'bg-[#0A0B0D]/20 text-[#0A0B0D]' : 'bg-[#15171B] border border-[#26282C] text-[#E9CC8B]'
              }`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-sm font-medium block leading-tight">
                  Mark as completed
                </span>
                <span className={`text-[11px] ${currentStatus === 'done' ? 'text-[#0A0B0D]/80' : 'text-[#9C978F]'}`}>
                  Counts as successful check-in
                </span>
              </div>
            </div>

            {currentStatus === 'done' && (
              <span className="text-xs font-semibold text-[#0A0B0D]">Active</span>
            )}
          </button>

          {/* 3. Reset / Clear (None) */}
          {currentStatus !== 'none' && (
            <button
              type="button"
              onClick={() => {
                onSetStatus('none');
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-dashed border-[#26282C] text-xs text-[#9C978F] hover:text-[#F3F0E9] hover:border-[#9C978F]/40 transition-colors cursor-pointer"
            >
              Reset to unrecorded
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
