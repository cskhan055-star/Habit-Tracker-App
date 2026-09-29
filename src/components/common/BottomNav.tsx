import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { ScreenId } from '../../types/habit';

interface BottomNavProps {
  activeScreen: ScreenId;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen }) => {
  const { setScreen, setEditingHabitId } = useHabit();

  const handleOpenAdd = () => {
    setEditingHabitId(null);
    setScreen('add');
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-md border-t border-[#26282C] px-4 pt-1 pb-3 sm:pb-4">
      <div className="relative flex items-center justify-between max-w-md mx-auto">
        {/* 1. Home Tab */}
        <button
          onClick={() => setScreen('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] cursor-pointer transition-colors ${
            activeScreen === 'home' ? 'text-[#E9CC8B]' : 'text-[#9C978F] hover:text-[#F3F0E9]'
          }`}
          aria-label="Home"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeScreen === 'home' ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] font-medium tracking-tight mt-1">Today</span>
        </button>

        {/* 2. Stats Tab */}
        <button
          onClick={() => setScreen('stats')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] cursor-pointer transition-colors ${
            activeScreen === 'stats' ? 'text-[#E9CC8B]' : 'text-[#9C978F] hover:text-[#F3F0E9]'
          }`}
          aria-label="Progress & Analytics"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeScreen === 'stats' ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="text-[10px] font-medium tracking-tight mt-1">Stats</span>
        </button>

        {/* 3. Center Elevated Gold FAB "+" */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            onClick={handleOpenAdd}
            className="w-13 h-13 rounded-full bg-gold-gradient text-[#0A0B0D] flex items-center justify-center gold-fab-shadow active:scale-95 hover:brightness-110 transition-transform cursor-pointer border-2 border-[#0A0B0D]"
            aria-label="Add New Habit"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* 4. Calendar / Detail Tab */}
        <button
          onClick={() => setScreen('detail')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] cursor-pointer transition-colors ${
            activeScreen === 'detail' ? 'text-[#E9CC8B]' : 'text-[#9C978F] hover:text-[#F3F0E9]'
          }`}
          aria-label="Calendar Heatmap"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeScreen === 'detail' ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[10px] font-medium tracking-tight mt-1">Calendar</span>
        </button>

        {/* 5. Widget Preview / Settings Tab */}
        <button
          onClick={() => setScreen('widget')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] cursor-pointer transition-colors ${
            activeScreen === 'widget' ? 'text-[#E9CC8B]' : 'text-[#9C978F] hover:text-[#F3F0E9]'
          }`}
          aria-label="Home-Screen Widget"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeScreen === 'widget' ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="text-[10px] font-medium tracking-tight mt-1">Widget</span>
        </button>
      </div>
    </div>
  );
};
