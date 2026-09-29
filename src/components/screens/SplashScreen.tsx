import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { AurumMark } from '../common/Icons';
import { LanguageSelectorModal } from '../common/LanguageSelectorModal';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

export const SplashScreen: React.FC = () => {
  const { setScreen, login, locale, t } = useHabit();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    // Smooth luxury authentication transition
    setTimeout(() => {
      login('cskhan055@gmail.com', 'S. Khan', 'lifetime');
      setIsGoogleLoading(false);
      setScreen('home');
    }, 550);
  };

  return (
    <div className="relative min-h-full flex flex-col justify-between px-6 py-12 overflow-hidden bg-[#0A0B0D] text-[#F3F0E9]">
      {/* Soft radial gold glow behind the mark */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(198, 161, 91, 0.14) 0%, rgba(10, 11, 13, 0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Top bar with Language Selector */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <span className="text-[10px] uppercase tracking-widest text-[#9C978F]/60">AURUM OS</span>
        <button
          onClick={() => setIsLangModalOpen(true)}
          className="px-2.5 py-1 rounded-full border border-[#26282C] bg-[#15171B]/80 hover:border-[#E9CC8B]/50 text-xs text-[#F3F0E9] flex items-center gap-1.5 transition-colors cursor-pointer"
          title={t('selectLanguage')}
        >
          <span>{currentLang.flag}</span>
          <span className="text-[11px] font-sans">{currentLang.nativeName}</span>
          <span className="text-[9px] text-[#9C978F]">▼</span>
        </button>
      </div>

      {/* Central Mark & Wordmark */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto transition-transform duration-300">
        {/* App Mark with circular subtle aura */}
        <div className="relative w-20 h-20 rounded-2xl bg-[#15171B] border border-[#26282C] flex items-center justify-center mb-8 shadow-sm">
          <AurumMark size={38} strokeWidth={1.5} />
        </div>

        {/* Serif Wordmark */}
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-wide text-[#F3F0E9] mb-3">
          Aurum
        </h1>

        {/* Quiet lower-case tagline */}
        <p className="text-[#9C978F] text-sm sm:text-base max-w-xs font-normal leading-relaxed">
          A quiet, disciplined way to build the habits that build you.
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-2.5 pb-4">
        {/* Primary Gold CTA */}
        <button
          onClick={() => setScreen('home')}
          className="w-full h-12.5 rounded-2xl bg-gold-gradient text-[#0A0B0D] font-medium text-sm tracking-wide flex items-center justify-center gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          {t('begin')}
        </button>

        {/* Secondary Ghost Button: Sign in with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full h-12 rounded-2xl border border-[#26282C] bg-[#15171B]/60 hover:bg-[#15171B] hover:border-[#C6A15B]/50 active:scale-[0.98] text-[#F3F0E9] font-medium text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xs"
        >
          {isGoogleLoading ? (
            <svg className="w-4 h-4 animate-spin text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isGoogleLoading ? 'Connecting to Google...' : t('signInWithGoogle')}</span>
        </button>

        {/* Tertiary Subtle Link */}
        <button
          onClick={() => setScreen('account')}
          className="w-full py-2 bg-transparent text-[#9C978F] hover:text-[#F3F0E9] font-normal text-xs transition-colors cursor-pointer"
        >
          {t('alreadyHaveAccount')}
        </button>
      </div>

      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </div>
  );
};
