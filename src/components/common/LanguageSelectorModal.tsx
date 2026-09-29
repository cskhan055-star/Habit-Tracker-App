import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { SUPPORTED_LANGUAGES, LanguageInfo } from '../../data/languages';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { locale, setLocale, t } = useHabit();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (lang: LanguageInfo) => {
    setLocale(lang.code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0B0D]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-[#121418] border border-[#2D3139] shadow-2xl text-[#F3F0E9] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#26282C]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1C1F24] border border-[#C6A15B]/30 flex items-center justify-center text-[#E9CC8B]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-[#F3F0E9] leading-tight">
                  {t('selectLanguage')}
                </h3>
                <p className="text-[11px] text-[#9C978F] mt-0.5">
                  English is primary • 30+ regional languages available
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#26282C] bg-[#181A1F] flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search Box */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by language (e.g. Urdu, हिन्दी, Español)..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl bg-[#0A0B0D] border border-[#26282C] text-xs text-[#F3F0E9] placeholder-[#9C978F]/50 focus:outline-none focus:border-[#C6A15B] transition-colors"
            />
            <svg
              className="w-4 h-4 text-[#9C978F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C978F] hover:text-[#F3F0E9]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-[#1F2228] max-h-[50vh]">
          {filteredLanguages.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9C978F]">
              No language found matching "{searchTerm}"
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`w-full py-3 px-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#211E16] to-[#17181C] border border-[#C6A15B]/50'
                      : 'hover:bg-[#181A1F] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0 select-none">{lang.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? 'text-[#E9CC8B]' : 'text-[#F3F0E9] group-hover:text-[#E9CC8B]'
                          }`}
                        >
                          {lang.nativeName}
                        </span>
                        {lang.code === 'en' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#C6A15B]/20 text-[#E9CC8B] border border-[#C6A15B]/40">
                            Primary
                          </span>
                        )}
                        {lang.isRTL && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#1F2228] text-[#9C978F] border border-[#2D3139]">
                            RTL
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#9C978F] block font-sans">
                        {lang.name} • {lang.code}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-gold-gradient text-[#0A0B0D] flex items-center justify-center shrink-0 shadow-xs">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <span className="text-xs text-[#9C978F]/50 group-hover:text-[#E9CC8B] transition-colors">
                      Select
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#26282C] bg-[#0E1013] flex items-center justify-between text-[11px] text-[#9C978F]">
          <span>Selected: {SUPPORTED_LANGUAGES.find((l) => l.code === locale)?.name || 'English'}</span>
          <button
            onClick={() => {
              setLocale('en');
              onClose();
            }}
            className="text-[#E9CC8B] hover:underline cursor-pointer"
          >
            Reset to English (Default)
          </button>
        </div>
      </div>
    </div>
  );
};
