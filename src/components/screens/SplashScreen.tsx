import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { AurumMark } from '../common/Icons';

export const SplashScreen: React.FC = () => {
  const { setScreen } = useHabit();

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

      {/* Top spacer for status bar ergonomics */}
      <div className="pt-8" />

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
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-3 pb-4">
        {/* Primary Gold CTA */}
        <button
          onClick={() => setScreen('home')}
          className="w-full h-13 rounded-2xl bg-gold-gradient text-[#0A0B0D] font-medium text-base tracking-wide flex items-center justify-center gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          Begin
        </button>

        {/* Secondary Ghost Button */}
        <button
          onClick={() => setScreen('home')}
          className="w-full h-13 rounded-2xl border border-[#26282C] bg-transparent text-[#9C978F] hover:text-[#F3F0E9] hover:border-[#9C978F]/40 active:scale-[0.98] font-normal text-sm transition-all cursor-pointer"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
};
