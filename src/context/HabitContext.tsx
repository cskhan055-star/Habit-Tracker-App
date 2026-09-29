import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit, CheckInMap, HabitReflectionMap, ScreenId, LuxuryTheme, UserAccount } from '../types/habit';
import { INITIAL_HABITS, generateInitialCheckIns, generateInitialReflections } from '../data/initialData';
import {
  DEFAULT_CURRENT_DATE,
  calculateOverallStreak,
  isHabitScheduledOnDate,
  parseDate,
} from '../utils/streakEngine';
import { triggerCheckInHaptic } from '../utils/haptics';

interface HabitContextType {
  habits: Habit[];
  checkIns: CheckInMap;
  reflections: HabitReflectionMap;
  activeScreen: ScreenId;
  selectedHabitId: string | null;
  editingHabitId: string | null;
  theme: LuxuryTheme;
  isPremium: boolean;
  user: UserAccount;
  currentDate: string;
  overallStreak: number;
  todayCheckInRatio: { completed: number; total: number };
  toggleCheckIn: (habitId: string, dateStr?: string) => void;
  saveReflection: (habitId: string, dateStr: string, note: string) => void;
  deleteReflection: (habitId: string, dateStr: string) => void;
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => string;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  setScreen: (screen: ScreenId) => void;
  setSelectedHabitId: (id: string | null) => void;
  setEditingHabitId: (id: string | null) => void;
  setTheme: (theme: LuxuryTheme) => void;
  toggleTheme: () => void;
  setPremium: (status: boolean) => void;
  login: (email: string, name?: string, plan?: 'free' | 'monthly' | 'yearly' | 'lifetime') => void;
  logout: () => void;
  updateUser: (updates: Partial<UserAccount>) => void;
  syncCloudData: () => Promise<boolean>;
  resetToDefaults: () => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

const STORAGE_KEY_HABITS = 'aurum_habits_v1';
const STORAGE_KEY_CHECKINS = 'aurum_checkins_v1';
const STORAGE_KEY_REFLECTIONS = 'aurum_reflections_v1';
const STORAGE_KEY_THEME = 'aurum_theme_v1';
const STORAGE_KEY_PREMIUM = 'aurum_premium_v1';
const STORAGE_KEY_USER = 'aurum_user_v1';

const DEFAULT_USER: UserAccount = {
  isLoggedIn: true,
  name: 'S. Khan',
  email: 'cskhan055@gmail.com',
  memberSince: 'September 2026',
  plan: 'lifetime',
  cloudSyncEnabled: true,
  lastSyncedAt: 'Just now',
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABITS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_HABITS;
  });

  const [checkIns, setCheckIns] = useState<CheckInMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKINS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generateInitialCheckIns();
  });

  const [reflections, setReflections] = useState<HabitReflectionMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REFLECTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return generateInitialReflections();
  });

  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>('habit-2'); // Default to Read 20 pages
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const [theme, setTheme] = useState<LuxuryTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as LuxuryTheme;
      if (saved === 'obsidian' || saved === 'antique-gold' || saved === 'ivory-marble') {
        return saved;
      }
      // Migration from previous boolean/string
      if (saved === ('light' as unknown)) return 'ivory-marble';
      if (saved === ('dark' as unknown)) return 'obsidian';
    } catch {
      // ignore
    }
    return 'obsidian';
  });

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREMIUM);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return false;
  });

  const currentDate = DEFAULT_CURRENT_DATE;

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    } catch {
      // ignore
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns));
    } catch {
      // ignore
    }
  }, [checkIns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REFLECTIONS, JSON.stringify(reflections));
    } catch {
      // ignore
    }
  }, [reflections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      document.documentElement.classList.remove('theme-obsidian', 'theme-antique-gold', 'theme-ivory-marble', 'theme-light');
      document.documentElement.classList.add(`theme-${theme}`);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREMIUM, JSON.stringify(isPremium));
    } catch {
      // ignore
    }
  }, [isPremium]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  const login = (email: string, name?: string, plan: 'free' | 'monthly' | 'yearly' | 'lifetime' = 'lifetime') => {
    setUser({
      isLoggedIn: true,
      email,
      name: name || email.split('@')[0],
      memberSince: 'September 2026',
      plan,
      cloudSyncEnabled: true,
      lastSyncedAt: 'Just now',
    });
    if (plan !== 'free') {
      setIsPremium(true);
    }
  };

  const logout = () => {
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  const updateUser = (updates: Partial<UserAccount>) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const syncCloudData = async (): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setUser((prev) => ({
      ...prev,
      lastSyncedAt: `Today at ${now}`,
    }));
    return true;
  };

  const toggleCheckIn = (habitId: string, dateStr: string = currentDate) => {
    setCheckIns((prev) => {
      const currentList = prev[habitId] || [];
      const alreadyChecked = currentList.includes(dateStr);
      let updatedList: string[];
      if (alreadyChecked) {
        updatedList = currentList.filter((d) => d !== dateStr);
      } else {
        updatedList = [...currentList, dateStr];
      }

      const nextCheckIns = {
        ...prev,
        [habitId]: updatedList,
      };

      const isCheckingIn = !alreadyChecked;
      let isDayComplete = false;
      if (isCheckingIn) {
        const dateObj = parseDate(dateStr);
        const scheduledHabits = habits.filter((h) => isHabitScheduledOnDate(h, dateObj));
        isDayComplete =
          scheduledHabits.length > 0 &&
          scheduledHabits.every((h) => {
            const list = h.id === habitId ? updatedList : nextCheckIns[h.id] || [];
            return list.includes(dateStr);
          });
      }

      // Fire subtle luxury tactile haptic feedback
      triggerCheckInHaptic(isCheckingIn, isDayComplete);

      return nextCheckIns;
    });
  };

  const saveReflection = (habitId: string, dateStr: string, note: string) => {
    setReflections((prev) => {
      const habitNotes = prev[habitId] || {};
      return {
        ...prev,
        [habitId]: {
          ...habitNotes,
          [dateStr]: note.trim(),
        },
      };
    });
  };

  const deleteReflection = (habitId: string, dateStr: string) => {
    setReflections((prev) => {
      const habitNotes = { ...(prev[habitId] || {}) };
      delete habitNotes[dateStr];
      return {
        ...prev,
        [habitId]: habitNotes,
      };
    });
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>): string => {
    const newId = `habit-${Date.now()}`;
    const newHabit: Habit = {
      ...habitData,
      id: newId,
      createdAt: currentDate,
    };
    setHabits((prev) => [...prev, newHabit]);
    setCheckIns((prev) => ({
      ...prev,
      [newId]: [],
    }));
    return newId;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCheckIns((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (selectedHabitId === id) {
      setSelectedHabitId(null);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'obsidian') return 'antique-gold';
      if (prev === 'antique-gold') return 'ivory-marble';
      return 'obsidian';
    });
  };

  const resetToDefaults = () => {
    setHabits(INITIAL_HABITS);
    setCheckIns(generateInitialCheckIns());
    setReflections(generateInitialReflections());
    setSelectedHabitId('habit-2');
    setTheme('obsidian');
    setIsPremium(false);
  };

  // Derived calculations
  const overallStreak = calculateOverallStreak(habits, checkIns, currentDate);

  const todayObj = parseDate(currentDate);
  const scheduledToday = habits.filter((h) => isHabitScheduledOnDate(h, todayObj));
  const completedToday = scheduledToday.filter((h) =>
    (checkIns[h.id] || []).includes(currentDate)
  ).length;

  const todayCheckInRatio = {
    completed: completedToday,
    total: scheduledToday.length,
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        checkIns,
        reflections,
        activeScreen,
        selectedHabitId,
        editingHabitId,
        theme,
        isPremium,
        user,
        currentDate,
        overallStreak,
        todayCheckInRatio,
        toggleCheckIn,
        saveReflection,
        deleteReflection,
        addHabit,
        updateHabit,
        deleteHabit,
        setScreen: setActiveScreen,
        setSelectedHabitId,
        setEditingHabitId,
        setTheme,
        toggleTheme,
        setPremium: setIsPremium,
        login,
        logout,
        updateUser,
        syncCloudData,
        resetToDefaults,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};
