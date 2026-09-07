import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Moving Aurora Borealis Fluid Wave Layers */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-purple-600/20 dark:from-cyan-400/15 dark:via-indigo-600/20 dark:to-purple-700/25 blur-3xl animate-aurora-1 opacity-70 transform-gpu will-change-transform" />
      
      <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/15 to-indigo-600/20 dark:from-purple-600/20 dark:via-fuchsia-600/20 dark:to-blue-700/25 blur-3xl animate-aurora-2 opacity-65 transform-gpu will-change-transform" />

      <div className="absolute -bottom-40 left-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-r from-emerald-400/15 via-teal-500/15 to-blue-600/20 dark:from-emerald-600/15 dark:via-cyan-600/20 dark:to-indigo-800/25 blur-3xl animate-aurora-3 opacity-60 transform-gpu will-change-transform" />

      {/* Subtle Aurora Mesh Grid Line Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80a_1px,transparent_1px)] bg-[size:32px_32px]" />
    </div>
  );
};


