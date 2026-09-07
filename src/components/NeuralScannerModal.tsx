import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import logoImg from '../assets/images/truthlens_app_logo_1786111909392.jpg';

interface NeuralScannerModalProps {
  isOpen: boolean;
  type: 'link' | 'media';
  statusSteps?: string[];
}

export const NeuralScannerModal: React.FC<NeuralScannerModalProps> = ({
  isOpen,
  type,
  statusSteps,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const defaultSteps =
    type === 'media'
      ? [
          'Initializing Deepfake AI Forensic Core...',
          'Extracting facial keypoint matrices & optical flow...',
          'Analyzing spectral acoustic frequency contours...',
          'Scanning for generative GAN artifact noise...',
          'Computing TruthLens AI Credibility Index...',
        ]
      : [
          'Connecting to Real-time Web Crawler...',
          'Extracting publisher metadata & domain age...',
          'Analyzing linguistic sentiment & clickbait indicators...',
          'Cross-referencing primary wire news sources...',
          'Computing TruthLens AI Credibility Index...',
        ];

  const steps = statusSteps && statusSteps.length > 0 ? statusSteps : defaultSteps;

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1100);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] p-6 text-center space-y-5">
        
        {/* Top Header Status */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>TruthLens AI Forensic Engine Active</span>
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
            {progressPercent}% ANALYZED
          </span>
        </div>

        {/* AI Scanner Radar & Logo Engine Container */}
        <div className="relative h-64 w-full rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-center overflow-hidden">
          
          {/* Ambient Background Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,rgba(59,130,246,0.08)_40%,transparent_70%)]" />

          {/* Circuit Trace Lines SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 20 L 120 80 L 200 80" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M 480 20 L 380 80 L 300 80" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M 20 230 L 120 170 L 200 170" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M 480 230 L 380 170 L 300 170" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <circle cx="120" cy="80" r="3" fill="#06b6d4" />
            <circle cx="380" cy="80" r="3" fill="#3b82f6" />
            <circle cx="120" cy="170" r="3" fill="#3b82f6" />
            <circle cx="380" cy="170" r="3" fill="#06b6d4" />
          </svg>

          {/* Light Ripples Expanding Outward */}
          <motion.div
            className="absolute rounded-full border border-cyan-400/40"
            initial={{ width: 70, height: 70, opacity: 0.8 }}
            animate={{ width: 230, height: 230, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0 }}
          />
          <motion.div
            className="absolute rounded-full border border-blue-500/40"
            initial={{ width: 70, height: 70, opacity: 0.8 }}
            animate={{ width: 230, height: 230, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
          />

          {/* Outer Holographic Rotating Ring */}
          <div className="absolute w-52 h-52 rounded-full border-2 border-dashed border-cyan-400/30 animate-[spin_12s_linear_infinite]" />
          
          {/* Middle Counter-Rotating Holographic Ring */}
          <div className="absolute w-40 h-40 rounded-full border border-indigo-500/40 border-t-cyan-400 border-r-blue-500 animate-[spin_7s_linear_infinite_reverse]" />

          {/* Inner Glowing Precision Ring */}
          <div className="absolute w-28 h-28 rounded-full border border-cyan-300/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />

          {/* Orbiting Light Particle 1 */}
          <motion.div
            className="absolute w-44 h-44 flex items-center justify-start pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
          </motion.div>

          {/* Orbiting Light Particle 2 */}
          <motion.div
            className="absolute w-56 h-56 flex items-center justify-end pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
          </motion.div>

          {/* Orbiting Light Particle 3 */}
          <motion.div
            className="absolute w-36 h-36 flex items-start justify-center pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
          </motion.div>

          {/* Emitting Floating Micro Digital Particles */}
          <motion.div
            className="absolute w-1 h-1 rounded-full bg-cyan-300"
            initial={{ y: 0, opacity: 1, x: -10 }}
            animate={{ y: -60, opacity: 0, x: -25 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
            initial={{ y: 0, opacity: 1, x: 15 }}
            animate={{ y: -70, opacity: 0, x: 30 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
          />

          {/* Central Official TruthLens AI Logo Engine */}
          <motion.div
            className="relative z-10 p-1.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 shadow-[0_0_40px_rgba(6,182,212,0.5)] border border-cyan-300/60"
            animate={{
              y: [-4, 4, -4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="relative overflow-hidden rounded-xl w-20 h-20 sm:w-22 sm:h-22 bg-slate-900 flex items-center justify-center p-0.5">
              <img
                src={logoImg}
                alt="TruthLens AI Engine Logo"
                className="w-full h-full object-cover rounded-xl border border-cyan-500/30"
                referrerPolicy="no-referrer"
              />

              {/* Scanning Wave Beam passing through logo every 2 seconds */}
              <motion.div
                className="absolute inset-x-0 h-3 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee] opacity-90"
                animate={{
                  top: ['-15%', '115%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>

          {/* Background Vertical Laser Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Step Indicator & Progress Bar */}
        <div className="space-y-2.5">
          <p className="text-sm font-extrabold text-slate-100 animate-pulse min-h-[22px] tracking-wide">
            {steps[currentStepIndex]}
          </p>
          <div className="w-full bg-slate-800/80 rounded-full h-2 p-0.5 overflow-hidden border border-slate-700/60 shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Multi-modal Deepfake & Fact-Check Neural Audit
          </p>
        </div>
      </div>
    </div>
  );
};
