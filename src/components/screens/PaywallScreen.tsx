import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { CrownIcon } from '../common/Icons';
import {
  AURUM_GOLD_PRODUCT_IDS,
  MOCK_PLAY_STORE_PRODUCTS,
  ProductDetails,
} from '../../billing/products';

type PlanOption = 'monthly' | 'yearly' | 'lifetime';

export const PaywallScreen: React.FC = () => {
  const {
    setScreen,
    isPremium,
    buyProduct,
    restorePurchases,
    isPurchasePending,
    lastPurchaseError,
    paywallOptions,
    t,
  } = useHabit();

  const [selectedPlan, setSelectedPlan] = useState<PlanOption>('yearly');
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);

  // Plan mapping to Google Play Product IDs
  const planToProductMap: Record<PlanOption, ProductDetails> = {
    monthly: MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.MONTHLY],
    yearly: MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.YEARLY],
    lifetime: MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.LIFETIME],
  };

  // Plan mapping to Google Play Product IDs (live query fallback)
  const monthlyProduct = planToProductMap.monthly;
  const yearlyProduct = planToProductMap.yearly;
  const lifetimeProduct = planToProductMap.lifetime;

  const handleSelectAndBuy = async (plan: PlanOption) => {
    setSelectedPlan(plan);
    const product = planToProductMap[plan];
    if (product) {
      await buyProduct(product);
    }
  };

  const handleMainCta = async () => {
    const product = planToProductMap[selectedPlan];
    if (product) {
      await buyProduct(product);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoreFeedback(null);
      await restorePurchases();
      setRestoreFeedback(t('purchaseRestored') || 'Purchases restored successfully.');
      setTimeout(() => setRestoreFeedback(null), 3500);
    } catch {
      setRestoreFeedback(t('purchaseFailed') || 'Unable to restore purchases.');
      setTimeout(() => setRestoreFeedback(null), 3500);
    }
  };

  // Contextual messaging based on trigger (Requirement 5)
  let headline = t('paywallTitle') || 'Unlock Aurum Gold';
  let subtitle = t('paywallSubtitle') || 'Unlimited habits, deeper insight, and a widget worthy of your home screen.';

  if (paywallOptions.trigger === 'language_locked') {
    headline = t('languageLockedTitle') || 'Unlock All Languages';
    subtitle = paywallOptions.targetLanguageName
      ? (t('unlockLanguageSubheadline', { language: paywallOptions.targetLanguageName }) ||
        `Including full ${paywallOptions.targetLanguageName} support`)
      : (t('languageLockedDesc') || 'Unlock all 30+ regional translations with Aurum Gold.');
  } else if (paywallOptions.trigger === 'habit_limit_reached') {
    headline = t('habitLimitReachedTitle') || 'Free Limit Reached';
    subtitle = t('habitLimitReachedDesc') || 'Free tier includes up to 5 habits. Upgrade to Aurum Gold for unlimited habits.';
  } else if (paywallOptions.trigger === 'calendar_history_locked') {
    headline = t('paywallTitle') || 'Full Heatmap History';
    subtitle = t('calendarHistoryLockedNote') || 'Free tier shows the current month. Upgrade to Aurum Gold to unlock full historical archives.';
  }

  return (
    <div className="relative min-h-full flex flex-col justify-between bg-[#0A0B0D] text-[#F3F0E9] px-6 pt-6 pb-6 overflow-hidden">
      {/* Radial Gold Glow */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(198, 161, 91, 0.13) 0%, rgba(10, 11, 13, 0) 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top Bar with Clear Unobstructed "Skip" Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleRestore}
            disabled={isPurchasePending}
            className="text-xs text-[#C6A15B] hover:text-[#E9CC8B] transition-colors cursor-pointer disabled:opacity-50"
          >
            {t('restorePurchases') || 'Restore Purchases'}
          </button>

          <button
            onClick={() => setScreen('home')}
            disabled={isPurchasePending}
            className="text-xs text-[#9C978F] hover:text-[#F3F0E9] px-3 py-1.5 rounded-lg border border-transparent hover:border-[#26282C] transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Crown Icon Badge (Outlined, Not Gaudy) */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#15171B] border border-[#C6A15B]/50 flex items-center justify-center text-[#E9CC8B] mb-4 shadow-sm">
            <CrownIcon size={30} strokeWidth={1.4} />
          </div>

          <h1 className="font-serif text-3xl font-normal text-[#F3F0E9] tracking-tight mb-2">
            {headline}
          </h1>
          <p className="text-xs text-[#9C978F] max-w-xs leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Feature Checkmark List */}
        <div className="max-w-xs mx-auto space-y-3 mb-7 px-2">
          {[
            'Unlimited habits & collections (no 5-habit cap)',
            'All 30+ regional languages unlocked',
            'Full historical calendar heatmap archive',
            'Unlimited skip days & travel protection',
            'Custom luxury widget themes & all-time analytics',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs text-[#F3F0E9]">
              <div className="w-4 h-4 rounded-full bg-[#1C1F24] border border-[#C6A15B]/50 flex items-center justify-center text-[#E9CC8B] shrink-0">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="font-normal">{feature}</span>
            </div>
          ))}
        </div>

        {/* Three Pricing Cards Side by Side (Wiring to Google Play buy()) */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {/* Monthly: aurum_gold_monthly */}
          <button
            type="button"
            disabled={isPurchasePending}
            onClick={() => handleSelectAndBuy('monthly')}
            className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer disabled:opacity-60 ${
              selectedPlan === 'monthly'
                ? 'bg-[#1C1F24] border-2 border-[#E9CC8B]'
                : 'bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90'
            }`}
          >
            <span className="text-[11px] text-[#9C978F] block">{t('paywallMonthly') || 'Monthly'}</span>
            <span className="font-serif text-lg font-normal text-[#F3F0E9] block mt-1">
              {monthlyProduct?.price || '$2.99'}
            </span>
            <span className="text-[10px] text-[#9C978F]/70 block mt-0.5">per month</span>
          </button>

          {/* Yearly: aurum_gold_yearly (Promoted as Best Value) */}
          <button
            type="button"
            disabled={isPurchasePending}
            onClick={() => handleSelectAndBuy('yearly')}
            className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer disabled:opacity-60 ${
              selectedPlan === 'yearly'
                ? 'bg-[#1C1F24] border-2 border-[#E9CC8B] shadow-md'
                : 'bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90'
            }`}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gold-gradient text-[#0A0B0D] text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap">
              Best Value
            </div>
            <span className="text-[11px] text-[#9C978F] block pt-1">{t('paywallYearly') || 'Yearly'}</span>
            <span className="font-serif text-lg font-normal text-gold-gradient block mt-1">
              {yearlyProduct?.price || '$19.99'}
            </span>
            <span className="text-[10px] text-[#9C978F]/70 block mt-0.5">7-day free trial</span>
          </button>

          {/* Lifetime: aurum_gold_lifetime */}
          <button
            type="button"
            disabled={isPurchasePending}
            onClick={() => handleSelectAndBuy('lifetime')}
            className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer disabled:opacity-60 ${
              selectedPlan === 'lifetime'
                ? 'bg-[#1C1F24] border-2 border-[#E9CC8B]'
                : 'bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90'
            }`}
          >
            <span className="text-[11px] text-[#9C978F] block">{t('paywallLifetime') || 'Lifetime'}</span>
            <span className="font-serif text-lg font-normal text-[#F3F0E9] block mt-1">
              {lifetimeProduct?.price || '$9.99'}
            </span>
            <span className="text-[10px] text-[#9C978F]/70 block mt-0.5">one time</span>
          </button>
        </div>

        {/* Feedback / Error Alerts */}
        {restoreFeedback && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#1C1F24] border border-[#C6A15B]/50 text-xs text-center text-[#E9CC8B]">
            {restoreFeedback}
          </div>
        )}

        {lastPurchaseError && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-center text-red-200">
            {lastPurchaseError}
          </div>
        )}

        {/* Social Proof */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="flex items-center gap-1 text-[#E9CC8B] mb-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-[#9C978F]">
            Rated 4.9 by over 50,000 members
          </span>
        </div>
      </div>

      {/* Bottom CTA Area */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-2.5">
        {isPremium ? (
          <div className="w-full h-13 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-200 font-medium text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Aurum Gold Active</span>
          </div>
        ) : (
          <button
            onClick={handleMainCta}
            disabled={isPurchasePending}
            className="w-full h-13 rounded-2xl bg-gold-gradient text-[#0A0B0D] font-medium text-sm tracking-wide flex items-center justify-center gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
          >
            {isPurchasePending ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-[#0A0B0D]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('purchasing') || 'Processing via Google Play...'}</span>
              </div>
            ) : selectedPlan === 'yearly' ? (
              t('paywallCta') || 'Start 7-Day Free Trial'
            ) : selectedPlan === 'monthly' ? (
              `Subscribe Monthly • ${monthlyProduct?.price || '$2.99'}`
            ) : (
              `Unlock Lifetime Access • ${lifetimeProduct?.price || '$9.99'}`
            )}
          </button>
        )}

        <p className="text-[10px] text-[#9C978F]/60 text-center">
          {t('paywallFinePrint') || 'Cancel anytime • Renews automatically'}
        </p>
      </div>
    </div>
  );
};
