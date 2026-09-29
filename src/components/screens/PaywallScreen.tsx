import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { CrownIcon } from '../common/Icons';

type PlanOption = 'monthly' | 'yearly' | 'lifetime';

export const PaywallScreen: React.FC = () => {
  const { setScreen, isPremium, setPremium } = useHabit();
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>('yearly');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStartTrial = () => {
    setIsSuccess(true);
    setPremium(true);
    setTimeout(() => {
      setScreen('home');
    }, 1200);
  };

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
          <div className="w-10" />
          <button
            onClick={() => setScreen('home')}
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
            Unlock Aurum Gold
          </h1>
          <p className="text-xs text-[#9C978F] max-w-xs leading-relaxed font-normal">
            Unlimited habits, deeper insight, and a widget worthy of your home screen.
          </p>
        </div>

        {/* Feature Checkmark List */}
        <div className="max-w-xs mx-auto space-y-3 mb-7 px-2">
          {[
            'Unlimited habits & collections',
            'Advanced analytics & trends',
            'Custom widget themes',
            'Priority support',
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

        {/* Three Pricing Cards Side by Side */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'bg-[#1C1F24] border-2 border-[#E9CC8B]'
                : 'bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90'
            }`}
          >
            <span className="text-[11px] text-[#9C978F] block">Monthly</span>
            <span className="font-serif text-lg font-normal text-[#F3F0E9] block mt-1">
              $2.99
            </span>
            <span className="text-[10px] text-[#9C978F]/70 block mt-0.5">per month</span>
          </button>

          {/* Yearly (Promoted as Best Value) */}
          <button
            type="button"
            onClick={() => setSelectedPlan('yearly')}
            className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer ${
              selectedPlan === 'yearly'
                ? 'bg-[#1C1F24] border-2 border-[#E9CC8B] shadow-md'
                : 'bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90'
            }`}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gold-gradient text-[#0A0B0D] text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap">
              Best Value
            </div>
            <span className="text-[11px] text-[#9C978F] block pt-1">Yearly</span>
            <span className="font-serif text-lg font-normal text-gold-gradient block mt-1">
              $19.99
            </span>
            <span className="text-[10px] text-[#9C978F]/70 block mt-0.5">per year</span>
          </button>

          {/* Lifetime */}
          <button
            type="button"
            onClick={() => setSelectedPlan('lifetime')}
            className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer ${
              selectedPlan === 'lifetime'
                ? 'bg-[#1C1F24] border-2 border-[#E9CC8B]'
                : 'bg-[#15171B] border border-[#26282C] hover:border-[#26282C]/90'
            }`}
          >
            <span className="text-[11px] text-[#9C978F] block">Lifetime</span>
            <span className="font-serif text-lg font-normal text-[#F3F0E9] block mt-1">
              $9.99
            </span>
            <span className="text-[10px] text-[#9C978F]/70 block mt-0.5">one time</span>
          </button>
        </div>

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
        {isSuccess ? (
          <div className="w-full h-13 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-200 font-medium text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Welcome to Aurum Gold</span>
          </div>
        ) : (
          <button
            onClick={handleStartTrial}
            className="w-full h-13 rounded-2xl bg-gold-gradient text-[#0A0B0D] font-medium text-sm tracking-wide flex items-center justify-center gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            Start 7-Day Free Trial
          </button>
        )}

        <p className="text-[10px] text-[#9C978F]/60 text-center">
          Cancel anytime • Renews automatically
        </p>
      </div>
    </div>
  );
};
