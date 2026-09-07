import React from 'react';
import {
  Clock,
  Trash2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  Link2,
  Newspaper,
  Eye,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { RecentSearchItem } from '../types';
import { useRecentSearches, formatRelativeTime, getTrustScoreBadge } from '../utils/recentSearches';

interface RecentSearchesSectionProps {
  onSelectSearch?: (item: RecentSearchItem) => void;
  maxItems?: number;
  filterType?: 'link' | 'news' | 'deepfake' | 'all';
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export const RecentSearchesSection: React.FC<RecentSearchesSectionProps> = ({
  onSelectSearch,
  maxItems = 10,
  filterType = 'all',
  compact = false,
  title = 'Recent Searches & Trust Scores',
  subtitle = 'History of verified queries, links, and evaluated credibility scores'
}) => {
  const { searches, removeSearch, clearSearches } = useRecentSearches();

  const filtered = searches.filter((s) => {
    if (filterType === 'all') return true;
    return s.type === filterType;
  }).slice(0, maxItems);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link2 className="w-3.5 h-3.5" />;
      case 'news':
        return <Newspaper className="w-3.5 h-3.5" />;
      case 'deepfake':
        return <Eye className="w-3.5 h-3.5" />;
      default:
        return <Search className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'link':
        return 'Link Audit';
      case 'news':
        return 'News Claim';
      case 'deepfake':
        return 'Media Scan';
      default:
        return 'Search';
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 text-center space-y-2">
        <Clock className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Recent Searches Yet</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          When you execute a credibility scan or news verification search, it will automatically save here with its calculated trust score.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {title}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold">
                {filtered.length} saved
              </span>
            </div>
            {!compact && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => clearSearches()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Clear search history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>

      {/* List of Recent Searches */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const badge = getTrustScoreBadge(item.trustScore);
          return (
            <div
              key={item.id}
              onClick={() => onSelectSearch && onSelectSearch(item)}
              className={`group relative p-3 sm:p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                onSelectSearch ? 'cursor-pointer' : ''
              }`}
            >
              {/* Left query info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${badge.bg} ${badge.border} border`}>
                  {item.trustScore >= 50 ? (
                    <ShieldCheck className={`w-4 h-4 ${badge.text}`} />
                  ) : (
                    <ShieldAlert className={`w-4 h-4 ${badge.text}`} />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {getTypeIcon(item.type)}
                      <span>{getTypeLabel(item.type)}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      • {formatRelativeTime(item.timestamp)}
                    </span>

                    {item.rating && (
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                        ({item.rating.replace(/_/g, ' ')})
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title || item.query}
                  </p>

                  {item.details && !compact && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Trust Score & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800/50">
                {/* Trust Score Pill */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${badge.bg} ${badge.border} shadow-2xs`}>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm sm:text-base font-black tracking-tight ${badge.text}`}>
                        {item.trustScore}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Trust Score
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(item.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {onSelectSearch && (
                  <div className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
