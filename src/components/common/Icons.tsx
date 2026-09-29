import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const FlameIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, strokeWidth = 1.6 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.63-1.5-2.5-1.5-4 0-1.1.9-2 2-2 1.5 0 2.5 1.5 2.5 3 0 3.31-2.69 6-6 6s-6-2.69-6-6c0-3.1 2-5.5 3.5-7.5.5 1.5 1.5 2.5 2 3.5-1 1-1.5 2-1.5 3.5z" />
  </svg>
);

export const WaterIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const DumbbellIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 5v14" />
    <path d="M18 5v14" />
    <path d="M2 9v6" />
    <path d="M22 9v6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <rect x="4" y="7" width="2" height="10" rx="1" />
    <rect x="18" y="7" width="2" height="10" rx="1" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const MeditateIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="5" r="2" />
    <path d="M4 18c2-2 5-3 8-3s6 1 8 3" />
    <path d="M12 7v5" />
    <path d="M8 14l-3 4" />
    <path d="M16 14l3 4" />
    <path d="M8 10h8" />
  </svg>
);

export const WalkIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="13" cy="4" r="2" />
    <path d="M7 21l3-6 3 2 3-5" />
    <path d="M10 13l2-4 3 2 2-3" />
    <path d="M4 17l4-2" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const LeafIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 8-9 5 1 8 5 8 9a7 7 0 0 1-7 7z" />
    <path d="M11 20v-9" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
);

export const CoffeeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

export const BrainIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
  </svg>
);

export const PenIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z" />
  </svg>
);

export const AurumMark: React.FC<IconProps> = ({ className = 'w-8 h-8', size = 32, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
  >
    <defs>
      <linearGradient id="aurumGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E9CC8B" />
        <stop offset="100%" stopColor="#C6A15B" />
      </linearGradient>
    </defs>
    <path
      d="M16 4C16 4 9 14.5 9 20C9 23.866 12.134 27 16 27C19.866 27 23 23.866 23 20C23 14.5 16 4 16 4Z"
      stroke="url(#aurumGold)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 12C16 12 13 17 13 19.5C13 21.1569 14.3431 22.5 16 22.5C17.6569 22.5 19 21.1569 19 19.5C19 17 16 12 16 12Z"
      fill="url(#aurumGold)"
      opacity="0.35"
    />
  </svg>
);

export const AVAILABLE_ICONS = [
  { id: 'water', label: 'Hydration', component: WaterIcon },
  { id: 'book', label: 'Reading', component: BookIcon },
  { id: 'workout', label: 'Fitness', component: DumbbellIcon },
  { id: 'sleep', label: 'Sleep', component: MoonIcon },
  { id: 'meditate', label: 'Mindfulness', component: MeditateIcon },
  { id: 'walk', label: 'Movement', component: WalkIcon },
  { id: 'heart', label: 'Health', component: HeartIcon },
  { id: 'leaf', label: 'Nutrition', component: LeafIcon },
  { id: 'sun', label: 'Morning', component: SunIcon },
  { id: 'coffee', label: 'Routine', component: CoffeeIcon },
  { id: 'brain', label: 'Deep Work', component: BrainIcon },
  { id: 'pen', label: 'Journaling', component: PenIcon },
  { id: 'target', label: 'Focus', component: TargetIcon },
];

export function getHabitIconComponent(iconId: string) {
  const match = AVAILABLE_ICONS.find((i) => i.id === iconId);
  return match ? match.component : SparkleFallbackIcon;
}

export const SparkleFallbackIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20, strokeWidth = 1.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);
