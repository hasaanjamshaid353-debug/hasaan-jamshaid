import React from 'react';

interface FastGptLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  glow?: boolean;
  darkText?: boolean;
}

export const FastGptLogo: React.FC<FastGptLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  glow = true,
  darkText = false,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  }[size];

  const badgeSize = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-0.5',
    xl: 'text-xs px-3 py-1',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek Vector Emblem */}
      <div className={`relative ${iconDimensions} shrink-0 flex items-center justify-center`}>
        {/* Ambient Glow */}
        {glow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-emerald-400 opacity-60 blur-md transform scale-110 -z-10" />
        )}

        {/* Outer Hex/Rounded Square Glass Canvas */}
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#1e2330] via-[#12161f] to-[#0a0d14] border border-cyan-400/40 shadow-inner flex items-center justify-center overflow-hidden p-1.5">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]"
          >
            <defs>
              <linearGradient id="fastGptGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="fastGptGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="fastGptSparkle" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>
            </defs>

            {/* Stylized Modern Futuristic 'F' & Neural Lightning Network */}
            <path
              d="M10 10H38C39.1 10 40 10.9 40 12C40 13.1 39.1 14 38 14H16V22H32C33.1 22 34 22.9 34 24C34 25.1 33.1 26 32 26H16V38C16 39.1 15.1 40 14 40C12.9 40 12 39.1 12 38V12C12 10.9 12.9 10 14 10Z"
              fill="url(#fastGptGrad1)"
            />

            {/* Dynamic Electric Chevron / Bolt */}
            <path
              d="M26 8L36 18L30 20L38 30L22 28L28 22L20 18L26 8Z"
              fill="url(#fastGptGrad2)"
              opacity="0.85"
            />

            {/* Core Neural Spark Diamond */}
            <circle cx="36" cy="12" r="3.5" fill="url(#fastGptSparkle)" />
            <circle cx="38" cy="30" r="2.5" fill="#34D399" />
            <circle cx="14" cy="38" r="2" fill="#22D3EE" />
          </svg>
        </div>
      </div>

      {/* Styled Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${textSize} text-transparent bg-clip-text ${
                darkText
                  ? 'bg-gradient-to-r from-slate-950 via-slate-800 to-cyan-700'
                  : 'bg-gradient-to-r from-white via-slate-100 to-cyan-200'
              } drop-shadow-xs`}
            >
              Fast
            </span>
            <span
              className={`font-black tracking-wider uppercase ${badgeSize} rounded-md bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-mono shadow-[0_0_12px_rgba(34,211,238,0.4)]`}
            >
              GPT
            </span>
          </div>
          {size === 'xl' && (
            <span className="text-xs text-cyan-400/90 font-medium tracking-wide mt-1">
              Autonomous Intelligence Engine
            </span>
          )}
        </div>
      )}
    </div>
  );
};
