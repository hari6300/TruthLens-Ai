import React, { useEffect, useRef, useState } from 'react';

interface SuccessCelebrationProps {
  score: number;
  rating: string;
  isCredible: boolean;
  title?: string;
  isDeepfakeScore?: boolean;
  onClose?: () => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  score,
  rating,
  isCredible,
  title,
  isDeepfakeScore = false,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [displayScore, setDisplayScore] = useState(0);

  // Score counter animation
  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(ease * score));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [score]);

  // Canvas Confetti Burst
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const colors = isCredible
      ? ['#10B981', '#3B82F6', '#6366F1', '#34D399', '#60A5FA']
      : ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316'];

    const confettiCount = 70;
    const particles = Array.from({ length: confettiCount }).map(() => ({
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.25,
      opacity: 1,
    }));

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let active = false;
      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        active = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rSpeed;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (active) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isCredible]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-center space-y-4">
      {/* Canvas Confetti Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Pulsing Backlight Halo */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30 animate-pulse ${
          isCredible ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="relative z-20 flex flex-col items-center justify-center space-y-3">
        {/* Self-drawing SVG Checkmark Icon */}
        <div
          className={`relative p-4 rounded-full border-2 ${
            isCredible
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/30'
              : 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/30'
          }`}
        >
          <svg className="w-12 h-12 stroke-current fill-none stroke-[3]" viewBox="0 0 24 24">
            {isCredible ? (
              <path
                className="animate-draw-check"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            ) : (
              <path
                className="animate-draw-check"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
            Forensic Verdict
          </span>
          <h3
            className={`text-2xl font-black ${
              isCredible ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {rating}
          </h3>
          {title && <p className="text-xs text-slate-300 max-w-md line-clamp-1 mt-1">{title}</p>}
        </div>

        {/* Dynamic Animated Trust / AI Score Counter */}
        {isDeepfakeScore ? (
          displayScore >= 40 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-950/90 px-6 py-3.5 rounded-2xl border border-rose-500/40 backdrop-blur-md shadow-lg">
              <div className="text-center sm:text-left">
                <span className="text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider block">
                  AI / DEEPFAKE PROBABILITY
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-500 font-mono tracking-tight">
                    {displayScore}% AI
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/80 font-bold">
                    {100 - displayScore}% Real
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-950/90 px-6 py-3.5 rounded-2xl border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <div className="text-center sm:text-left">
                <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider block">
                  REAL / AUTHENTIC CONFIDENCE
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {100 - displayScore}% REAL
                  </span>
                  <span className="text-xs font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/80 font-bold">
                    {displayScore}% AI Risk
                  </span>
                </div>
              </div>
            </div>
          )
        ) : (
          isCredible ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-950/90 px-6 py-3.5 rounded-2xl border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <div className="text-center sm:text-left">
                <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider block">
                  REAL / AUTHENTIC CONFIDENCE
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {displayScore}% REAL
                  </span>
                  <span className="text-xs font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/80 font-bold">
                    {100 - displayScore}% Disinfo Risk
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-950/90 px-6 py-3.5 rounded-2xl border border-rose-500/40 backdrop-blur-md shadow-lg">
              <div className="text-center sm:text-left">
                <span className="text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider block">
                  AI / DISINFORMATION PROBABILITY
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-rose-500 font-mono tracking-tight">
                    {100 - displayScore}% AI / FAKE
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/80 font-bold">
                    {displayScore}% Credible
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
