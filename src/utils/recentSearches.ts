import { useState, useEffect, useCallback } from 'react';
import { RecentSearchItem } from '../types';

const STORAGE_KEY = 'truthlens_recent_searches_v1';
const EVENT_NAME = 'recent-searches-updated';

export const DEFAULT_RECENT_SEARCHES: RecentSearchItem[] = [
  {
    id: 'search-seed-1',
    query: 'https://x.com/BreakingGlobalAlerts/status/189283749201',
    title: 'Secret Central Bank Gold Seizure Allegation',
    trustScore: 24,
    rating: 'HIGHLY_DECEPTIVE',
    type: 'link',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    url: 'https://x.com/BreakingGlobalAlerts/status/189283749201',
    category: 'FINANCIAL',
    details: 'Sensationalist social media post alleging covert gold confiscation. Zero primary central bank corroboration.'
  },
  {
    id: 'search-seed-2',
    query: 'Quantum Computing Error Correction Breakthrough in Nature',
    title: 'Quantum Computing Error Correction Breakthrough',
    trustScore: 95,
    rating: 'VERIFIED_REAL',
    type: 'news',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 1 hour ago
    category: 'TECHNOLOGY',
    details: 'Peer-reviewed research in Nature detailing 99.9% fault-tolerant quantum logic gate benchmark.'
  },
  {
    id: 'search-seed-3',
    query: 'synthesized_politician_audio_leak.mp3',
    title: 'Synthesized Politician Audio Leak',
    trustScore: 12,
    rating: 'HIGH_RISK_DEEPFAKE',
    type: 'deepfake',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    category: 'POLITICAL',
    details: 'ElevenLabs neural voice clone with high-frequency 11kHz cutoff and unnatural monotonic cadence.'
  },
  {
    id: 'search-seed-4',
    query: 'Global Climate Summit Reaches Landmark Accord in Geneva',
    title: 'Global Climate Summit Emissions Accord',
    trustScore: 97,
    rating: 'VERIFIED_REAL',
    type: 'news',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    category: 'POLITICAL',
    details: 'Verified agreement across 192 countries with official UN and multi-wire correspondent validation.'
  }
];

// Helper to get stored items
export function getStoredRecentSearches(): RecentSearchItem[] {
  if (typeof window === 'undefined') return DEFAULT_RECENT_SEARCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECENT_SEARCHES));
      return DEFAULT_RECENT_SEARCHES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_RECENT_SEARCHES;
  } catch (e) {
    console.warn('Failed to parse recent searches from localStorage:', e);
    return DEFAULT_RECENT_SEARCHES;
  }
}

// Helper to save a successful search with trust score
export async function saveRecentSearch(
  item: Omit<RecentSearchItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): Promise<RecentSearchItem> {
  const newItem: RecentSearchItem = {
    id: item.id || 'search-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    query: item.query.trim(),
    title: item.title.trim() || item.query.trim(),
    trustScore: Math.round(Math.min(100, Math.max(0, item.trustScore))),
    rating: item.rating,
    type: item.type || 'link',
    timestamp: item.timestamp || new Date().toISOString(),
    url: item.url,
    category: item.category,
    details: item.details
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getStoredRecentSearches();
      // Remove any previous entry with the exact same query to avoid duplicates and bring to top
      const filtered = current.filter(
        (s) => s.query.toLowerCase() !== newItem.query.toLowerCase() && s.id !== newItem.id
      );
      const updated = [newItem, ...filtered].slice(0, 40); // keep up to 40
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.warn('Failed to save recent search to localStorage:', e);
    }
  }

  // Also persist to backend API asynchronously
  try {
    fetch('/api/recent-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(() => {});
  } catch {}

  return newItem;
}

// Helper to delete an item
export async function deleteRecentSearch(id: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const current = getStoredRecentSearches();
      const updated = current.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.warn('Failed to delete recent search:', e);
    }
  }

  try {
    fetch(`/api/recent-searches?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch {}
}

// Helper to clear all items
export async function clearAllRecentSearches(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  }

  try {
    fetch('/api/recent-searches', {
      method: 'DELETE'
    }).catch(() => {});
  } catch {}
}

// React Hook to consume and observe recent searches in real time
export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearchItem[]>(() => getStoredRecentSearches());

  useEffect(() => {
    // Initial fetch from backend to sync any server-side recorded scans
    fetch('/api/recent-searches')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then((serverData) => {
        if (serverData && Array.isArray(serverData.searches) && serverData.searches.length > 0) {
          const local = getStoredRecentSearches();
          // Merge unique by query
          const mergedMap = new Map<string, RecentSearchItem>();
          serverData.searches.forEach((s: RecentSearchItem) => mergedMap.set(s.query.toLowerCase(), s));
          local.forEach((s) => mergedMap.set(s.query.toLowerCase(), s));
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ).slice(0, 40);

          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setSearches(merged);
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RecentSearchItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setSearches(customEvent.detail);
      } else {
        setSearches(getStoredRecentSearches());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addSearch = useCallback(
    async (item: Omit<RecentSearchItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
      return await saveRecentSearch(item);
    },
    []
  );

  const removeSearch = useCallback(async (id: string) => {
    await deleteRecentSearch(id);
  }, []);

  const clearSearches = useCallback(async () => {
    await clearAllRecentSearches();
  }, []);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
    clearAll: clearSearches
  };
}

// Relative time formatter
export function formatRelativeTime(timestamp: string): string {
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

// Color and styling helpers based on trust score
export function getTrustScoreBadge(score: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (score >= 75) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: 'Verified High Trust'
    };
  }
  if (score >= 50) {
    return {
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      text: 'text-cyan-700 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800',
      label: 'Moderate Trust'
    };
  }
  if (score >= 35) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'Uncertain / Questionable'
    };
  }
  return {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'High Risk / Fake'
  };
}
