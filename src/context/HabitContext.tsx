import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Habit,
  CheckInMap,
  CheckInStatus,
  CheckInRecordMap,
  HabitReflectionMap,
  ScreenId,
  LuxuryTheme,
  UserAccount,
} from '../types/habit';
import { INITIAL_HABITS, generateInitialCheckIns, generateInitialReflections } from '../data/initialData';
import {
  DEFAULT_CURRENT_DATE,
  calculateOverallStreak,
  getHabitDayStatus,
  isHabitScheduledOnDate,
  parseDate,
} from '../utils/streakEngine';
import { triggerCheckInHaptic } from '../utils/haptics';
import { isLanguageRTL } from '../data/languages';
import { getTranslation, TranslationKeys } from '../data/translations';
import { AurumEntitlement } from '../billing/entitlement';
import { billingService } from '../billing/BillingService';
import { ProductDetails, PurchaseDetails } from '../billing/products';

export type HomeViewMode = 'list' | 'focus';

export interface PaywallContextOptions {
  trigger?: 'habit_limit_reached' | 'language_locked' | 'calendar_history_locked' | 'general';
  targetLanguageName?: string;
}

interface HabitContextType {
  habits: Habit[];
  checkIns: CheckInMap; // provides date lists or status records
  checkInRecords: CheckInRecordMap; // normalized { habitId: { dateStr: 'done' | 'skipped' | 'missed' } }
  reflections: HabitReflectionMap;
  activeScreen: ScreenId;
  selectedHabitId: string | null;
  editingHabitId: string | null;
  theme: LuxuryTheme;
  isPremium: boolean;
  entitlement: AurumEntitlement; // Centralized Entitlement model with reactive getters
  paywallOptions: PaywallContextOptions;
  openPaywall: (options?: PaywallContextOptions) => void;
  user: UserAccount;
  locale: string;
  isRTL: boolean;
  t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string;
  setLocale: (code: string) => void;
  currentDate: string;
  overallStreak: number;
  todayCheckInRatio: { completed: number; total: number };
  homeViewMode: HomeViewMode;
  setHomeViewMode: (mode: HomeViewMode) => void;
  toggleCheckIn: (habitId: string, dateStr?: string) => void;
  setCheckInStatus: (habitId: string, dateStr: string, status: CheckInStatus | 'none') => void;
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
  // Billing methods
  buyProduct: (product: ProductDetails) => Promise<void>;
  restorePurchases: () => Promise<void>;
  isPurchasePending: boolean;
  lastPurchaseError: string | null;
  login: (email: string, name?: string, plan?: 'free' | 'monthly' | 'yearly' | 'lifetime') => void;
  logout: () => void;
  updateUser: (updates: Partial<UserAccount>) => void;
  syncCloudData: () => Promise<boolean>;
  resetToDefaults: () => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

const STORAGE_KEY_HABITS = 'aurum_habits_v1';
const STORAGE_KEY_CHECKINS = 'aurum_checkins_v1';
const STORAGE_KEY_CHECKIN_RECORDS = 'aurum_checkin_records_v1';
const STORAGE_KEY_REFLECTIONS = 'aurum_reflections_v1';
const STORAGE_KEY_THEME = 'aurum_theme_v1';
const STORAGE_KEY_PREMIUM = 'aurum_premium_v1';
const STORAGE_KEY_USER = 'aurum_user_v1';
const STORAGE_KEY_LOCALE = 'aurum_locale_v1';
const STORAGE_KEY_HOME_VIEW_MODE = 'aurum_home_view_mode_v1';

const DEFAULT_USER: UserAccount = {
  isLoggedIn: true,
  name: 'S. Khan',
  email: 'cskhan055@gmail.com',
  memberSince: 'September 2026',
  plan: 'free',
  cloudSyncEnabled: true,
  lastSyncedAt: 'Today at 09:40 AM',
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCALE);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'en'; // English is primary / default
  });

  const isRTL = isLanguageRTL(locale);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY_LOCALE, newLocale);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale, isRTL]);

  const t = (key: keyof TranslationKeys, params?: Record<string, string | number>) => {
    return getTranslation(locale, key, params);
  };

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

  // Home view mode persisted preference (List vs Focus view)
  const [homeViewMode, setHomeViewModeState] = useState<HomeViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOME_VIEW_MODE) as HomeViewMode;
      if (saved === 'list' || saved === 'focus') return saved;
    } catch {
      // ignore
    }
    return 'list';
  });

  const setHomeViewMode = (mode: HomeViewMode) => {
    setHomeViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_HOME_VIEW_MODE, mode);
    } catch {
      // ignore
    }
  };

  // Support rich check-in status (done | missed | skipped)
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecordMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKIN_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    const initialArrays = generateInitialCheckIns();
    const result: CheckInRecordMap = {};
    Object.entries(initialArrays).forEach(([hId, dates]) => {
      result[hId] = {};
      dates.forEach((d) => {
        result[hId][d] = 'done';
      });
    });
    return result;
  });

  // Derive legacy checkIns map for full backwards compatibility
  const checkIns: CheckInMap = useMemo(() => {
    const map: CheckInMap = {};
    Object.entries(checkInRecords).forEach(([hId, recs]) => {
      map[hId] = Object.entries(recs)
        .filter(([, status]) => status === 'done')
        .map(([date]) => date);
    });
    return map;
  }, [checkInRecords]);

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

  // Contextual Paywall trigger state
  const [paywallOptions, setPaywallOptions] = useState<PaywallContextOptions>({ trigger: 'general' });

  const openPaywall = (options: PaywallContextOptions = { trigger: 'general' }) => {
    setPaywallOptions(options);
    setActiveScreen('paywall');
  };

  const [theme, setTheme] = useState<LuxuryTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as LuxuryTheme;
      if (saved === 'obsidian' || saved === 'antique-gold' || saved === 'ivory-marble') {
        return saved;
      }
      if (saved === ('light' as unknown)) return 'ivory-marble';
      if (saved === ('dark' as unknown)) return 'obsidian';
    } catch {
      // ignore
    }
    return 'obsidian';
  });

  // In-App Purchase / Billing State
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREMIUM);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return false;
  });

  const [isPurchasePending, setIsPurchasePending] = useState<boolean>(false);
  const [lastPurchaseError, setLastPurchaseError] = useState<string | null>(null);

  // Centralized Entitlement model instance (Requirement 3)
  const entitlement = useMemo(() => new AurumEntitlement(isPremium), [isPremium]);

  // Subscribe to Google Play Billing updates on app start
  useEffect(() => {
    const unsubscribe = billingService.listenToPurchaseUpdates((purchase: PurchaseDetails) => {
      switch (purchase.status) {
        case 'pending':
          setIsPurchasePending(true);
          setLastPurchaseError(null);
          break;

        case 'purchased':
        case 'restored':
          setIsPurchasePending(false);
          setLastPurchaseError(null);
          setIsPremium(true);

          // Update user plan to match purchased product
          if (purchase.productId.includes('monthly')) {
            setUser((prev) => ({ ...prev, plan: 'monthly' }));
          } else if (purchase.productId.includes('yearly')) {
            setUser((prev) => ({ ...prev, plan: 'yearly' }));
          } else {
            setUser((prev) => ({ ...prev, plan: 'lifetime' }));
          }
          break;

        case 'error':
          setIsPurchasePending(false);
          setLastPurchaseError(purchase.errorMessage || 'Purchase failed. Please check your payment method.');
          break;

        case 'canceled':
          setIsPurchasePending(false);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const buyProduct = async (product: ProductDetails) => {
    setLastPurchaseError(null);
    await billingService.buy(product);
  };

  const restorePurchases = async () => {
    setLastPurchaseError(null);
    setIsPurchasePending(true);
    await billingService.restorePurchases();
  };

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
      localStorage.setItem(STORAGE_KEY_CHECKIN_RECORDS, JSON.stringify(checkInRecords));
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns));
    } catch {
      // ignore
    }
  }, [checkInRecords, checkIns]);

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

  /**
   * Set specific status for a habit on a date: 'done' | 'skipped' | 'missed' | 'none'
   */
  const setCheckInStatus = (habitId: string, dateStr: string, status: CheckInStatus | 'none') => {
    setCheckInRecords((prev) => {
      const habitRecs = { ...(prev[habitId] || {}) };
      if (status === 'none') {
        delete habitRecs[dateStr];
      } else {
        habitRecs[dateStr] = status;
      }
      return {
        ...prev,
        [habitId]: habitRecs,
      };
    });
  };

  /**
   * Toggle completion status between 'done' and uncompleted (none)
   */
  const toggleCheckIn = (habitId: string, dateStr: string = currentDate) => {
    setCheckInRecords((prev) => {
      const habitRecs = { ...(prev[habitId] || {}) };
      const currentStatus = habitRecs[dateStr];
      const isCheckingIn = currentStatus !== 'done';

      if (isCheckingIn) {
        habitRecs[dateStr] = 'done';
      } else {
        delete habitRecs[dateStr];
      }

      const nextRecords = {
        ...prev,
        [habitId]: habitRecs,
      };

      let isDayComplete = false;
      if (isCheckingIn) {
        const dateObj = parseDate(dateStr);
        const scheduledHabits = habits.filter((h) => isHabitScheduledOnDate(h, dateObj));
        isDayComplete =
          scheduledHabits.length > 0 &&
          scheduledHabits.every((h) => {
            const st = getHabitDayStatus(nextRecords[h.id], dateStr);
            return st === 'done' || st === 'skipped';
          });
      }

      // Luxury tactile haptic feedback
      triggerCheckInHaptic(isCheckingIn, isDayComplete);

      return nextRecords;
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
    setCheckInRecords((prev) => ({
      ...prev,
      [newId]: {},
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
    setCheckInRecords((prev) => {
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
    const initialArrays = generateInitialCheckIns();
    const result: CheckInRecordMap = {};
    Object.entries(initialArrays).forEach(([hId, dates]) => {
      result[hId] = {};
      dates.forEach((d) => {
        result[hId][d] = 'done';
      });
    });
    setCheckInRecords(result);
    setReflections(generateInitialReflections());
    setSelectedHabitId('habit-2');
    setTheme('obsidian');
    setHomeViewMode('list');
    setIsPremium(false);
  };

  // Derived calculations with skip day support
  const overallStreak = calculateOverallStreak(habits, checkInRecords, currentDate);

  const todayObj = parseDate(currentDate);
  const scheduledToday = habits.filter((h) => isHabitScheduledOnDate(h, todayObj));
  const completedToday = scheduledToday.filter((h) => {
    const status = getHabitDayStatus(checkInRecords[h.id], currentDate);
    return status === 'done';
  }).length;

  const todayCheckInRatio = {
    completed: completedToday,
    total: scheduledToday.length,
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        checkIns,
        checkInRecords,
        reflections,
        activeScreen,
        selectedHabitId,
        editingHabitId,
        theme,
        isPremium,
        entitlement,
        paywallOptions,
        openPaywall,
        user,
        locale,
        isRTL,
        setLocale,
        t,
        currentDate,
        overallStreak,
        todayCheckInRatio,
        homeViewMode,
        setHomeViewMode,
        toggleCheckIn,
        setCheckInStatus,
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
        buyProduct,
        restorePurchases,
        isPurchasePending,
        lastPurchaseError,
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
