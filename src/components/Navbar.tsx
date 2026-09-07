import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/images/truthlens_app_logo_1786111909392.jpg';
import {
  ShieldAlert,
  BarChart3,
  BarChart2,
  Newspaper,
  Link2,
  Eye,
  Flag,
  BookOpen,
  AlertTriangle,
  Search,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Clock,
  Trash2
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useRecentSearches, getTrustScoreBadge, formatRelativeTime } from '../utils/recentSearches';

interface NavbarProps {
  activeTab: 'dashboard' | 'link' | 'category' | 'deepfake' | 'flagged' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'link' | 'category' | 'deepfake' | 'flagged' | 'guide') => void;
  onOpenFlagModal: () => void;
  pendingFlagsCount: number;
  onSelectSearchResult?: (tab: 'dashboard' | 'link' | 'category' | 'deepfake' | 'flagged' | 'guide', query?: string) => void;
}

// Sample Autocomplete Directory Items
const SEARCH_DATABASE = [
  {
    type: 'deepfake',
    title: 'Synthesized Politician Audio Leak',
    subtitle: 'Voice Clone • ElevenLabs model',
    tab: 'deepfake' as const
  },
  {
    type: 'deepfake',
    title: 'Viral Explosive Incident Photo',
    subtitle: 'Generative Image • Midjourney v6',
    tab: 'deepfake' as const
  },
  {
    type: 'link',
    title: 'Central Bank Gold Seizure Allegation',
    subtitle: 'Viral X/Twitter Disinfo Claim',
    tab: 'link' as const
  },
  {
    type: 'flagged',
    title: 'Deepfake Audio of Election Commissioner',
    subtitle: 'Community Flagged Threat',
    tab: 'flagged' as const
  },
  {
    type: 'guide',
    title: 'High-Frequency Spectral Cutoffs (Audio)',
    subtitle: 'Forensic Detection Technique',
    tab: 'guide' as const
  },
  {
    type: 'guide',
    title: 'Specular Light Vector Incoherence',
    subtitle: 'Generative AI Visual Signature',
    tab: 'guide' as const
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFlagModal,
  pendingFlagsCount,
  onSelectSearchResult
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'Search viral claims & social posts...',
    'Search deepfake voice audio samples...',
    'Search synthetic face swap photos...',
    'Search community threat index...'
  ];

  const { searches: recentSearches, removeSearch, clearSearches } = useRecentSearches();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);
  const searchRef = useRef<HTMLDivElement>(null);

  const matchingRecentSearches = searchQuery.trim()
    ? recentSearches.filter(
        (item) =>
          item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentSearches.slice(0, 5);

  const filteredResults = searchQuery.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRecentSearch = (item: (typeof recentSearches)[0]) => {
    const targetTab = item.type === 'news' ? 'category' : item.type === 'deepfake' ? 'deepfake' : 'link';
    setActiveTab(targetTab);
    if (onSelectSearchResult) {
      onSelectSearchResult(targetTab, item.query);
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSelectResult = (item: (typeof SEARCH_DATABASE)[0]) => {
    setActiveTab(item.tab);
    if (onSelectSearchResult) {
      onSelectSearchResult(item.tab, item.title);
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Live Engine Status */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer shrink-0 hover-popup-sm p-1 rounded-xl transition-all"
        >
          <img
            src={logoImg}
            alt="TruthLens AI Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-md shadow-blue-500/20 border border-blue-500/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent">
                TruthLens AI
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              AI Credibility & Deepfake Intelligence
            </p>
          </div>
        </div>

        {/* Global Search with Autocomplete & Dynamic Expansion */}
        <div
          className={`relative transition-all duration-300 ease-out hidden lg:block ${
            isSearchFocused ? 'w-[400px] z-30' : 'w-64'
          }`}
          ref={searchRef}
        >
          <div className="relative group">
            <Search className={`w-4 h-4 absolute left-3.5 top-2.5 transition-colors ${
              isSearchFocused ? 'text-blue-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              placeholder={placeholders[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                setSearchOpen(true);
                setIsSearchFocused(true);
              }}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:shadow-blue-500/10 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete & Recent Searches Dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-2 max-h-[380px] overflow-y-auto">
              {/* If user is typing query */}
              {searchQuery.trim() ? (
                <>
                  {/* Matching Recent Searches */}
                  {matchingRecentSearches.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-2 py-1 text-[10px] font-mono font-bold uppercase text-slate-400">
                        Recent Searches ({matchingRecentSearches.length})
                      </p>
                      {matchingRecentSearches.map((item) => {
                        const badge = getTrustScoreBadge(item.trustScore);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                            onClick={() => handleSelectRecentSearch(item)}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {item.title || item.query}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className="uppercase">{item.type}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(item.timestamp)}</span>
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${badge.bg} ${badge.border} ${badge.text} border`}>
                              {item.trustScore}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Threat Directory Matches */}
                  {filteredResults.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="px-2 py-1 text-[10px] font-mono font-bold uppercase text-slate-400">
                        Directory Topics
                      </p>
                      {filteredResults.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectResult(item)}
                          className="w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {item.subtitle}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Fallback quick scan button if no matches */}
                  {matchingRecentSearches.length === 0 && filteredResults.length === 0 && (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No prior logs match "{searchQuery}".
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('link');
                          onSelectSearchResult?.('link', searchQuery);
                          setSearchOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Scan Query in Link Authenticator
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* When search input is empty: show Recent Searches & Trust Scores */
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      Recent Searches & Trust Scores
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSearches();
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {recentSearches.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No searches logged yet. Successfully analyze links or headlines to save trust scores!
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((item) => {
                        const badge = getTrustScoreBadge(item.trustScore);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                            onClick={() => handleSelectRecentSearch(item)}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {item.title || item.query}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="uppercase font-semibold">{item.type}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(item.timestamp)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badge.bg} ${badge.border} ${badge.text} border`}>
                                {item.trustScore}% Trust
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSearch(item.id);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove search"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested Quick Topics */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                    <p className="px-2 text-[10px] font-mono font-bold uppercase text-slate-400">
                      Suggested Quick Lookups
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {SEARCH_DATABASE.slice(0, 3).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectResult(item)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors truncate max-w-full"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-950/70 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Link Scan
          </button>

          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-cyan-500" />
            News Detection
          </button>

          <button
            onClick={() => setActiveTab('deepfake')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'deepfake'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Deepfake Lab
          </button>

          <button
            onClick={() => setActiveTab('flagged')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'flagged'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Flagged
            {pendingFlagsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] rounded-full border border-rose-200 dark:border-rose-800 font-bold">
                {pendingFlagsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Guide
          </button>
        </nav>

        {/* Right Actions: Theme Toggle & Flag Threat Button */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover-popup-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Flag Threat CTA */}
          <button
            onClick={onOpenFlagModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-sm hover-popup-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flag Threat</span>
          </button>
        </div>
      </div>

      {/* Mobile Touch Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200/80 dark:border-slate-800/80 py-2 px-1 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'link' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Scan
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'category' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Newspaper className="w-4 h-4 text-cyan-500" />
          News Detection
        </button>
        <button
          onClick={() => setActiveTab('deepfake')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'deepfake' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Eye className="w-4 h-4" />
          Deepfake
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'flagged' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Flag className="w-4 h-4" />
          Flagged
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'guide' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Guide
        </button>
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          Theme
        </button>
      </div>
    </header>
  );
};
