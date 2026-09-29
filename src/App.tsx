/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HabitProvider, useHabit } from './context/HabitContext';
import { ScreenId } from './types/habit';
import { SplashScreen } from './components/screens/SplashScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { AddHabitScreen } from './components/screens/AddHabitScreen';
import { HabitDetailScreen } from './components/screens/HabitDetailScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { PaywallScreen } from './components/screens/PaywallScreen';
import { WidgetPreviewScreen } from './components/screens/WidgetPreviewScreen';
import { AccountScreen } from './components/screens/AccountScreen';
import { AurumMark, CrownIcon } from './components/common/Icons';
import { THEME_PRESETS } from './data/themePresets';
import { LanguageSelectorModal } from './components/common/LanguageSelectorModal';
import { SUPPORTED_LANGUAGES } from './data/languages';

const SCREEN_TABS: { id: ScreenId; label: string; number: string }[] = [
  { id: 'account', label: 'Account', number: '01' },
  { id: 'home', label: 'Home', number: '02' },
  { id: 'add', label: 'Add/Edit', number: '03' },
  { id: 'detail', label: 'Detail', number: '04' },
  { id: 'stats', label: 'Stats', number: '05' },
  { id: 'paywall', label: 'Paywall', number: '06' },
  { id: 'widget', label: 'Widget', number: '07' },
];

function AppContent() {
  const { activeScreen, setScreen, theme, setTheme, resetToDefaults, user, locale, isRTL } = useHabit();
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'account':
        return <AccountScreen />;
      case 'splash':
        return <SplashScreen />;
      case 'home':
        return <HomeScreen />;
      case 'add':
        return <AddHabitScreen />;
      case 'detail':
        return <HabitDetailScreen />;
      case 'stats':
        return <StatsScreen />;
      case 'paywall':
        return <PaywallScreen />;
      case 'widget':
        return <WidgetPreviewScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060708] text-[#F3F0E9] flex flex-col items-center">
      {/* Top Designer / Reviewer Control Bar (Elevated desktop inspection bar) */}
      <header className="w-full bg-[#0A0B0D]/95 border-b border-[#26282C] px-4 py-2.5 z-50 sticky top-0 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#15171B] border border-[#26282C] flex items-center justify-center">
              <AurumMark size={18} strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-serif text-base tracking-wide text-[#F3F0E9] block leading-none">
                Aurum
              </span>
              <span className="text-[10px] text-[#9C978F] font-normal">
                Luxury Habit Architecture
              </span>
            </div>
          </div>

          {/* Screen Switcher Tabs (01 to 07) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {SCREEN_TABS.map((tab) => {
              const isActive = activeScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setScreen(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm'
                      : 'text-[#9C978F] hover:text-[#F3F0E9] hover:bg-[#15171B]'
                  }`}
                >
                  <span className={`text-[10px] ${isActive ? 'text-[#0A0B0D]/70' : 'text-[#9C978F]/60'}`}>
                    {tab.number}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Tools: Theme Presets, Frame Toggle, Reset */}
          <div className="flex items-center gap-2">
            {/* Luxury Theme Preset Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[#26282C] bg-[#15171B]">
              {THEME_PRESETS.map((preset) => {
                const isActive = theme === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setTheme(preset.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm font-semibold'
                        : 'text-[#9C978F] hover:text-[#F3F0E9]'
                    }`}
                    title={preset.tagline}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 border border-black/20"
                      style={{ backgroundColor: preset.goldHex }}
                    />
                    <span className="hidden xl:inline">{preset.name}</span>
                    <span className="xl:hidden">{preset.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Selector Pill */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-[#26282C] bg-[#15171B] hover:border-[#E9CC8B]/40 text-xs font-medium text-[#F3F0E9] transition-all cursor-pointer flex items-center gap-1.5"
              title="Change Language (English Primary)"
            >
              <span className="text-sm">{currentLang.flag}</span>
              <span className="font-sans text-[11px] hidden sm:inline">{currentLang.nativeName}</span>
              <span className="text-[10px] text-[#9C978F]">▼</span>
            </button>

            {/* Account / Login Quick Button */}
            <button
              onClick={() => setScreen('account')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeScreen === 'account'
                  ? 'bg-gold-gradient text-[#0A0B0D] border-transparent font-semibold shadow-sm'
                  : 'border-[#26282C] bg-[#15171B] text-[#F3F0E9] hover:border-[#E9CC8B]/40 hover:text-[#E9CC8B]'
              }`}
              title="Account & Profile"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="max-w-[90px] truncate">{user.isLoggedIn ? user.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Frame toggle for desktop */}
            <button
              onClick={() => setDeviceFrameMode(!deviceFrameMode)}
              className="hidden md:flex px-2.5 py-1 rounded-lg border border-[#26282C] bg-[#15171B] text-xs text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer items-center gap-1.5"
              title="Toggle mobile device frame"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>{deviceFrameMode ? 'Device' : 'Fluid'}</span>
            </button>

            {/* Reset mock data */}
            <button
              onClick={resetToDefaults}
              className="p-1 rounded-lg border border-[#26282C] bg-[#15171B] text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer"
              title="Reset to default Figma values"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex items-center justify-center p-0 md:p-6 lg:p-8">
        {deviceFrameMode ? (
          /* High-Fidelity Mobile Device Chassis */
          <div className="w-full max-w-[420px] h-[100dvh] md:h-[844px] md:max-h-[92vh] md:rounded-[44px] bg-[#0A0B0D] border-0 md:border-[7px] md:border-[#1F2228] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(198,161,91,0.18)] flex flex-col overflow-hidden relative">
            {/* Phone Top Notch / Speaker & Status Bar */}
            <div className="shrink-0 h-10 px-7 pt-2 flex items-center justify-between text-xs text-[#F3F0E9] font-medium z-30 select-none bg-[#0A0B0D]">
              <span className="tabular-nums tracking-tight">9:41</span>
              {/* Camera punch hole / dynamic pill */}
              <div className="w-20 h-4 bg-[#050507] rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-xs text-[#F3F0E9]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
                </svg>
                <div className="w-5 h-2.5 border border-[#F3F0E9] rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-full bg-[#E9CC8B] rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Screen Inner Scrollable View */}
            <div className="flex-1 overflow-y-auto scrollbar-none relative bg-[#0A0B0D]">
              {renderActiveScreen()}
            </div>

            {/* Phone Bottom Home Bar */}
            <div className="shrink-0 h-4 w-full bg-[#0A0B0D] flex items-center justify-center pointer-events-none pb-1">
              <div className="w-32 h-1 bg-[#F3F0E9]/30 rounded-full" />
            </div>
          </div>
        ) : (
          /* Fluid Responsive Full-Screen Container */
          <div className="w-full max-w-lg min-h-[844px] bg-[#0A0B0D] border border-[#26282C] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {renderActiveScreen()}
            </div>
          </div>
        )}
      </main>

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}
