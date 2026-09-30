/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HabitProvider, useHabit } from './context/HabitContext';
import { SplashScreen } from './components/screens/SplashScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { AddHabitScreen } from './components/screens/AddHabitScreen';
import { HabitDetailScreen } from './components/screens/HabitDetailScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { PaywallScreen } from './components/screens/PaywallScreen';
import { WidgetPreviewScreen } from './components/screens/WidgetPreviewScreen';
import { AccountScreen } from './components/screens/AccountScreen';
import { NotificationBanner } from './components/common/NotificationBanner';
import { NotificationService } from './services/notificationService';

function AppContent() {
  const { activeScreen, habits, checkInRecords, currentDate, overallStreak } = useHabit();

  // Periodic reminder scheduler evaluating user-defined daily and per-habit reminder times
  useEffect(() => {
    const evaluate = () => {
      NotificationService.evaluateAndTriggerReminders({
        habits,
        checkInRecords,
        currentDate,
        overallStreak,
      });
    };

    // Run initial evaluation
    evaluate();

    // Check every 20 seconds for precise time matching
    const timer = setInterval(evaluate, 20000);
    return () => clearInterval(timer);
  }, [habits, checkInRecords, currentDate, overallStreak]);

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
      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex items-center justify-center p-0 md:p-6 lg:p-8">
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

          {/* Luxury In-App Push Notification Banner */}
          <NotificationBanner />

          {/* Screen Inner Scrollable View */}
          <div className="flex-1 overflow-y-auto scrollbar-none relative bg-[#0A0B0D]">
            {renderActiveScreen()}
          </div>

          {/* Phone Bottom Home Bar */}
          <div className="shrink-0 h-4 w-full bg-[#0A0B0D] flex items-center justify-center pointer-events-none pb-1">
            <div className="w-32 h-1 bg-[#F3F0E9]/30 rounded-full" />
          </div>
        </div>
      </main>
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
