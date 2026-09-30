import React from 'react';

interface ConsistencyRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
}

export const ConsistencyRing: React.FC<ConsistencyRingProps> = ({
  score,
  size = 32,
  strokeWidth = 3,
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Gentle non-shaming dimming: higher scores shine brighter gold, lower scores become a calm muted gold
  const isHigh = clampedScore >= 80;
  const isMedium = clampedScore >= 50 && clampedScore < 80;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      title={`Consistency Score: ${clampedScore}% (exponential moving average)`}
    >
      <svg
        className="-rotate-90 transform"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={`goldRingGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C6A15B" />
            <stop offset="100%" stopColor="#E9CC8B" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#26282C"
          strokeWidth={strokeWidth}
        />

        {/* Foreground gold progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#goldRingGrad-${size})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isHigh ? 1 : isMedium ? 0.85 : 0.65,
          }}
        />
      </svg>

      {showPercentage && (
        <span
          className="absolute inset-0 flex items-center justify-center font-mono font-medium text-[9px] tabular-nums tracking-tighter"
          style={{
            color: isHigh ? '#E9CC8B' : isMedium ? '#D4AF37' : '#9C978F',
          }}
        >
          {clampedScore}
        </span>
      )}
    </div>
  );
};
