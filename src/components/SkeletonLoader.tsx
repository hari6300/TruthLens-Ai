import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export const GaugeSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center space-y-3 animate-pulse">
      <div className="w-28 h-28 rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-12" />
      </div>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-28" />
    </div>
  );
};

export const ListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-2 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};
