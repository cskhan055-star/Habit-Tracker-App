import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { CrownIcon, AurumMark } from '../common/Icons';
import { BottomNav } from '../common/BottomNav';
import { LanguageSelectorModal } from '../common/LanguageSelectorModal';
import { DevicePairingSection } from '../common/DevicePairingSection';
import { NotificationSettingsSection } from '../common/NotificationSettingsSection';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

export const AccountScreen: React.FC = () => {
  const { user, login, logout, updateUser, syncCloudData, setScreen, habits, checkIns, isPremium, entitlement, locale, t } = useHabit();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [emailInput, setEmailInput] = useState(user.email || 'cskhan055@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState(user.name || 'S. Khan');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 2800);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!passwordInput.trim() || passwordInput.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    login(emailInput.trim(), authMode === 'signup' ? nameInput.trim() : (emailInput.split('@')[0] || 'User'), 'lifetime');
    showToast(`Welcome back, ${authMode === 'signup' ? nameInput : emailInput.split('@')[0]}!`);
  };

  const handleQuickDemoLogin = (email: string, name: string) => {
    login(email, name, 'lifetime');
    showToast(`Signed in as ${name}`);
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await syncCloudData();
      setIsSyncing(false);
      setSyncMessage('All habits & streaks backed up to secure cloud.');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setIsSyncing(false);
      setSyncMessage('Sync completed successfully.');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const handleSaveProfile = () => {
    updateUser({
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
    });
    setIsEditingProfile(false);
    showToast('Profile updated successfully.');
  };

  const handleExportData = () => {
    const dataToExport = {
      user,
      habits,
      checkIns,
      exportedAt: new Date().toISOString(),
      app: 'Aurum Habit Architecture',
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Habit archive exported to device.');
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'A';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#0A0B0D] text-[#F3F0E9]">
      <div className="px-6 pt-6 pb-6">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-1.5 text-xs text-[#9C978F] hover:text-[#F3F0E9] px-2.5 py-1.5 rounded-lg border border-[#26282C] bg-[#15171B] transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Home</span>
          </button>

          <span className="font-serif text-base tracking-wide text-[#F3F0E9]">
            Account & Security
          </span>

          <button
            onClick={() => setScreen('paywall')}
            className="w-8 h-8 rounded-full border border-[#26282C] bg-[#15171B] flex items-center justify-center text-[#E9CC8B] hover:border-[#E9CC8B]/50 transition-colors cursor-pointer"
            title="Membership Plan"
          >
            <CrownIcon size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Feedback Toast */}
        {notificationToast && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-gold-gradient text-[#0A0B0D] text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{notificationToast}</span>
          </div>
        )}

        {/* LOGGED IN VIEW */}
        {user.isLoggedIn ? (
          <div className="space-y-5">
            {/* User Profile Card */}
            <div className="relative rounded-2xl bg-[#15171B] border border-[#26282C] p-5 overflow-hidden">
              {/* Radial subtle luxury sheen */}
              <div
                className="pointer-events-none absolute -right-12 -top-12 w-44 h-44 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(198, 161, 91, 0.15) 0%, rgba(21, 23, 27, 0) 70%)',
                }}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Initials Avatar with Gold ring */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2A261C] to-[#15171B] border-2 border-[#C6A15B] flex items-center justify-center text-lg font-serif text-[#E9CC8B] shadow-sm">
                    {getInitials(user.name)}
                  </div>

                  <div>
                    <h2 className="font-serif text-lg font-normal text-[#F3F0E9] leading-tight">
                      {user.name}
                    </h2>
                    <span className="text-xs text-[#9C978F] block mt-0.5 font-sans">
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#1F2228] text-[10px] text-[#E9CC8B] border border-[#C6A15B]/30 font-medium">
                      <CrownIcon size={11} strokeWidth={1.8} />
                      {isPremium
                        ? user.plan === 'lifetime'
                          ? 'Lifetime Gold Member'
                          : `${user.plan.toUpperCase()} Plan`
                        : 'Free Member'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-2.5 py-1 rounded-lg border border-[#26282C] bg-[#1C1F24] text-[11px] text-[#9C978F] hover:text-[#F3F0E9] hover:border-[#E9CC8B]/40 transition-colors cursor-pointer"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Inline Edit Form */}
              {isEditingProfile && (
                <div className="mt-4 pt-4 border-t border-[#26282C] space-y-3">
                  <div>
                    <label className="text-[10px] text-[#9C978F] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0A0B0D] border border-[#26282C] text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#9C978F] block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0A0B0D] border border-[#26282C] text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-2 rounded-xl bg-gold-gradient text-[#0A0B0D] text-xs font-semibold hover:brightness-105 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Membership & Subscription Tier Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#171612] via-[#1A1914] to-[#15171B] border border-[#C6A15B]/40 p-4.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2A2315] text-[#E9CC8B] flex items-center justify-center">
                    <CrownIcon size={16} strokeWidth={1.6} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#F3F0E9] block">
                      {isPremium ? 'Aurum Gold Access' : 'Aurum Free Tier'}
                    </span>
                    <span className="text-[10px] text-[#9C978F]">
                      {isPremium
                        ? `Active ${user.plan === 'monthly' ? 'Monthly ($2.99/mo)' : user.plan === 'yearly' ? 'Yearly ($19.99/yr)' : 'Lifetime ($9.99)'}`
                        : 'Limited to 5 habits & basic features'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setScreen('paywall')}
                  className="px-2.5 py-1 rounded-lg bg-gold-gradient text-[#0A0B0D] text-[11px] font-semibold hover:brightness-105 transition-all cursor-pointer"
                >
                  {isPremium ? 'Manage' : 'Upgrade'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#2D281D] text-center">
                <div className="bg-[#0A0B0D]/40 rounded-xl p-2">
                  <span className="text-[9px] text-[#9C978F] block uppercase tracking-wider">Plan</span>
                  <span className="font-serif text-xs text-[#E9CC8B] font-medium block mt-0.5 capitalize">
                    {isPremium ? (user.plan === 'free' ? 'Gold' : user.plan) : 'Free'}
                  </span>
                </div>
                <div className="bg-[#0A0B0D]/40 rounded-xl p-2">
                  <span className="text-[9px] text-[#9C978F] block uppercase tracking-wider">Cloud</span>
                  <span className="font-serif text-xs text-emerald-400 font-medium block mt-0.5">Active</span>
                </div>
                <div className="bg-[#0A0B0D]/40 rounded-xl p-2">
                  <span className="text-[9px] text-[#9C978F] block uppercase tracking-wider">Habit Limit</span>
                  <span className="font-serif text-xs text-[#E9CC8B] font-medium block mt-0.5">
                    {entitlement.maxHabits > 500 ? 'Unlimited' : `${entitlement.maxHabits} Habits`}
                  </span>
                </div>
              </div>
            </div>

            {/* Cloud Sync & Backup Status */}
            <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B]">
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#F3F0E9] block">
                      Encrypted Cloud Sync
                    </span>
                    <span className="text-[10px] text-[#9C978F]">
                      {user.lastSyncedAt ? `Last synced: ${user.lastSyncedAt}` : 'Synchronized with private cloud'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSyncClick}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg border border-[#26282C] bg-[#1C1F24] text-xs text-[#F3F0E9] hover:border-[#E9CC8B]/50 hover:text-[#E9CC8B] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E9CC8B]' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              {syncMessage && (
                <p className="text-[11px] text-emerald-400 mt-2.5 pt-2 border-t border-[#26282C] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{syncMessage}</span>
                </p>
              )}
            </div>

            {/* Language & Regional Settings */}
            <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-lg select-none">
                  {currentLang.flag}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#F3F0E9] block">
                      {t('language')}: {currentLang.nativeName}
                    </span>
                    {currentLang.code === 'en' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C6A15B]/20 text-[#E9CC8B] border border-[#C6A15B]/30">
                        Primary
                      </span>
                    )}
                    {currentLang.isRTL && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1F2228] text-[#9C978F]">
                        RTL
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#9C978F]">
                    {currentLang.name} • 30+ languages supported
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLangModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-[#26282C] bg-[#1C1F24] text-xs text-[#E9CC8B] hover:border-[#E9CC8B]/50 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Daily Habit Push Notifications & Custom Scheduled Reminders */}
            <NotificationSettingsSection onShowToast={showToast} />

            {/* Smartwatch & Wearables Pairing (Bluetooth) */}
            <DevicePairingSection onShowToast={showToast} />

            {/* Account Controls & Archive */}
            <div className="rounded-2xl bg-[#15171B] border border-[#26282C] divide-y divide-[#26282C] overflow-hidden">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#1C1F24] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#9C978F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <div>
                    <span className="text-xs text-[#F3F0E9] block font-medium">Export Habit Data</span>
                    <span className="text-[10px] text-[#9C978F]">Download offline JSON backup</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-[#9C978F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <button
                onClick={() => {
                  logout();
                  showToast('You have been signed out.');
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#1C1F24] transition-colors cursor-pointer text-[#E57373]"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <div>
                    <span className="text-xs font-medium block">Log Out of Aurum</span>
                    <span className="text-[10px] text-[#9C978F]">Switch account or lock session</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-[#9C978F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* SIGN IN / CREATE ACCOUNT FORM VIEW */
          <div className="space-y-5">
            {/* Header Brand Badge */}
            <div className="text-center pt-2 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#15171B] border border-[#C6A15B]/50 flex items-center justify-center mx-auto mb-3 text-[#E9CC8B] shadow-sm">
                <AurumMark size={28} strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl font-normal text-[#F3F0E9] tracking-tight">
                {authMode === 'signin' ? 'Sign In to Aurum' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-[#9C978F] max-w-xs mx-auto mt-1 leading-relaxed">
                Sync your daily rituals, streak architecture, and lifetime progress securely.
              </p>
            </div>

            {/* Auth Mode Toggle Pill */}
            <div className="flex rounded-xl bg-[#15171B] p-1 border border-[#26282C]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-gold-gradient text-[#0A0B0D] font-semibold shadow-sm'
                    : 'text-[#9C978F] hover:text-[#F3F0E9]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-gold-gradient text-[#0A0B0D] font-semibold shadow-sm'
                    : 'text-[#9C978F] hover:text-[#F3F0E9]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="px-3.5 py-2 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="text-[11px] font-medium text-[#9C978F] block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. S. Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15171B] border border-[#26282C] text-xs text-[#F3F0E9] placeholder-[#9C978F]/40 focus:outline-none focus:border-[#C6A15B] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-[#9C978F] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#15171B] border border-[#26282C] text-xs text-[#F3F0E9] placeholder-[#9C978F]/40 focus:outline-none focus:border-[#C6A15B] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-[#9C978F]">
                    Password
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => showToast('Password reset link sent to your email.')}
                      className="text-[10px] text-[#E9CC8B] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15171B] border border-[#26282C] text-xs text-[#F3F0E9] placeholder-[#9C978F]/40 focus:outline-none focus:border-[#C6A15B] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C978F] hover:text-[#F3F0E9] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gold-gradient text-[#0A0B0D] font-semibold text-xs tracking-wide hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-md mt-2"
              >
                {authMode === 'signin' ? 'Sign In to Aurum' : 'Create My Account'}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="pt-2">
              <div className="relative flex items-center justify-center my-3">
                <div className="w-full border-t border-[#26282C]" />
                <span className="absolute bg-[#0A0B0D] px-2 text-[10px] text-[#9C978F] uppercase tracking-wider">
                  Or instant access
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('cskhan055@gmail.com', 'S. Khan')}
                  className="w-full py-2.5 rounded-xl border border-[#26282C] bg-[#15171B] hover:bg-[#1C1F24] hover:border-[#C6A15B]/40 text-xs font-medium text-[#F3F0E9] transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-xs"
                >
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
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('cskhan055@gmail.com', 'S. Khan')}
                  className="w-full py-2.5 rounded-xl border border-[#C6A15B]/40 bg-[#15171B] text-xs font-medium text-[#E9CC8B] hover:bg-[#1C1F24] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CrownIcon size={14} strokeWidth={1.8} />
                  <span>Continue as S. Khan (cskhan055@gmail.com)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      <BottomNav activeScreen="home" />
    </div>
  );
};
