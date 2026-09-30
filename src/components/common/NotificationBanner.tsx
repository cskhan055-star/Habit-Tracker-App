import React, { useState, useEffect } from 'react';
import { AurumMark } from './Icons';
import { useHabit } from '../../context/HabitContext';

interface InAppNotificationData {
  title: string;
  body: string;
  timestamp: number;
}

export const NotificationBanner: React.FC = () => {
  const { setScreen } = useHabit();
  const [notification, setNotification] = useState<InAppNotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<InAppNotificationData>;
      if (customEvent.detail) {
        setNotification(customEvent.detail);
        setIsVisible(true);
      }
    };

    window.addEventListener('aurum-inapp-notification', handleNotification);
    return () => {
      window.removeEventListener('aurum-inapp-notification', handleNotification);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [isVisible, notification]);

  if (!notification || !isVisible) return null;

  return (
    <div className="absolute top-12 left-3 right-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl bg-[#15171B]/95 border border-[#C6A15B]/40 p-3.5 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-[#F3F0E9]">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#1C1F24] border border-[#C6A15B]/30 flex items-center justify-center shrink-0 mt-0.5">
            <AurumMark size={16} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#E9CC8B] tracking-wide truncate">
                {notification.title}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C6A15B]/20 text-[#E9CC8B] font-mono shrink-0">
                Now
              </span>
            </div>
            <p className="text-[11px] text-[#D8D3CA] mt-0.5 leading-snug line-clamp-2">
              {notification.body}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsVisible(false);
                  setScreen('home');
                }}
                className="px-2.5 py-1 rounded-lg bg-gold-gradient text-[#0A0B0D] text-[10px] font-semibold hover:brightness-105 transition-all cursor-pointer"
              >
                Open Habits
              </button>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="text-[10px] text-[#9C978F] hover:text-[#F3F0E9] transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-[#9C978F] hover:text-[#F3F0E9] p-1 transition-colors cursor-pointer shrink-0"
          aria-label="Close notification"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
