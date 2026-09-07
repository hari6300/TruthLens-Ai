import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

interface TrustGaugeProps {
  score: number; // 0 to 100
  type?: 'credibility' | 'deepfake' | 'risk';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showDetails?: boolean;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({
  score,
  type = 'credibility',
  size = 'md',
  label,
  showDetails = true
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [score]);

  // Determine colors based on score and type
  // For credibility: high is good (green), low is bad (red)
  // For deepfake/risk: high is bad (red), low is good (green)
  let isGood = false;
  let isWarning = false;
  let isCritical = false;

  if (type === 'credibility') {
    if (animatedScore >= 75) isGood = true;
    else if (animatedScore >= 45) isWarning = true;
    else isCritical = true;
  } else {
    // deepfake / risk
    if (animatedScore >= 70) isCritical = true;
    else if (animatedScore >= 40) isWarning = true;
    else isGood = true;
  }

  const strokeColor = isGood
    ? '#10b981' // emerald-500
    : isWarning
    ? '#f59e0b' // amber-500
    : '#f43f5e'; // rose-500

  const glowClass = isGood
    ? 'shadow-[0_0_20px_rgba(16,185,129,0.35)] dark:shadow-[0_0_25px_rgba(16,185,129,0.45)]'
    : isWarning
    ? 'shadow-[0_0_20px_rgba(245,158,11,0.35)] dark:shadow-[0_0_25px_rgba(245,158,11,0.45)]'
    : 'shadow-[0_0_20px_rgba(244,63,94,0.35)] dark:shadow-[0_0_25px_rgba(244,63,94,0.45)]';

  const badgeBg = isGood
    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    : isWarning
    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';

  const statusText = isGood
    ? type === 'credibility' ? 'Verified High Trust' : 'Authentic Media'
    : isWarning
    ? type === 'credibility' ? 'Unverified / Caution' : 'Suspected Filter / Edit'
    : type === 'credibility' ? 'High Risk Deceptive' : 'High Risk Synthetic Deepfake';

  // SVG parameters
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const radius = size === 'lg' ? 60 : size === 'md' ? 48 : 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const dimension = radius * 2 + strokeWidth * 2 + 10;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 ${glowClass} transition-all`}>
      <div className="relative flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90 drop-shadow-sm"
        >
          {/* Background circle track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Animated progress ring */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-black tracking-tight ${
              size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
            }`}
            style={{ color: strokeColor }}
          >
            {animatedScore}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {type === 'credibility' ? 'Credibility' : 'Synthetic'}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 text-center space-y-1">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
            {isGood ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : isWarning ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            {statusText}
          </span>
          {label && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
              {label}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
