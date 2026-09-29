import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { THEME_PRESETS } from '../../data/themePresets';
import { LuxuryTheme } from '../../types/habit';
import { triggerSelectionHaptic } from '../../utils/haptics';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useHabit();

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: LuxuryTheme) => {
    setTheme(newTheme);
    triggerSelectionHaptic();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#15171B] border border-[#26282C] p-6 shadow-2xl transition-transform animate-in fade-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#26282C]">
          <div>
            <h2 id="theme-modal-title" className="font-serif text-lg font-normal text-[#F3F0E9] tracking-tight">
              Luxury Theme
            </h2>
            <p className="text-xs text-[#9C978F] mt-0.5">
              Select your obsidian or marble visual identity
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 3 Presets List */}
        <div className="space-y-3 mb-6">
          {THEME_PRESETS.map((preset) => {
            const isSelected = theme === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectTheme(preset.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1C1F24] border-[#E9CC8B] shadow-md ring-1 ring-[#E9CC8B]/40'
                    : 'bg-[#15171B] border-[#26282C] hover:border-[#26282C]/90 hover:bg-[#181B20]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  {/* Swatch Quad Pill */}
                  <div
                    className="w-10 h-10 rounded-xl border border-[#26282C] p-1 grid grid-cols-2 gap-0.5 shrink-0"
                    style={{ backgroundColor: preset.bgHex }}
                  >
                    <span className="rounded-xs" style={{ backgroundColor: preset.surfaceHex }} />
                    <span className="rounded-xs" style={{ backgroundColor: preset.goldHex }} />
                    <span className="rounded-xs" style={{ backgroundColor: preset.goldHex }} />
                    <span className="rounded-xs" style={{ backgroundColor: preset.textHex }} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[#F3F0E9] truncate">
                        {preset.name}
                      </h3>
                      {preset.id === 'obsidian' && (
                        <span className="text-[10px] text-[#9C978F]/80">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-[#9C978F] truncate mt-0.5">
                      {preset.tagline}
                    </p>
                  </div>
                </div>

                {/* Selection Radio / Ring */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-gold-gradient text-[#0A0B0D]'
                      : 'border border-[#26282C]'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-gold-gradient text-[#0A0B0D] font-medium text-xs tracking-wide flex items-center justify-center cursor-pointer gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all"
        >
          Apply Palette
        </button>
      </div>
    </div>
  );
};
