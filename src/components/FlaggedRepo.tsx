import React, { useEffect, useState } from 'react';
import {
  Flag,
  Search,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Mic,
  Video,
  Image as ImageIcon,
  PlusCircle,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { FlaggedItem } from '../types';

interface FlaggedRepoProps {
  onOpenFlagModal: () => void;
}

export const FlaggedRepo: React.FC<FlaggedRepoProps> = ({ onOpenFlagModal }) => {
  const [flags, setFlags] = useState<FlaggedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          setFlags(data.flaggedItems || []);
        }
      }
    } catch {
      // Safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleVote = async (flagId: string, voteType: 'up' | 'down') => {
    try {
      const res = await fetch('/api/flag/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, voteType })
      });

      if (res.ok) {
        const updatedItem = await res.json();
        setFlags((prev) =>
          prev.map((f) => (f.id === flagId ? updatedItem : f))
        );
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const filteredFlags = flags.filter((item) => {
    const matchesSearch =
      item.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.contentType === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'high':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header Banner - Glassmorphism */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <Flag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Community Flagged Disinformation & Deepfakes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Flagged Content Repository
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Real-time community reporting database. Upvote consensus verifications and report suspicious social posts or synthetic media.
          </p>
        </div>

        <button
          onClick={onOpenFlagModal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Flag New Threat</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search flagged titles, claims, handles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'SOCIAL_LINK', label: 'Links' },
            { id: 'VOICE_CLONE', label: 'Voice Clones' },
            { id: 'VIDEO_DEEPFAKE', label: 'Video Deepfakes' },
            { id: 'IMAGE_DEEPFAKE', label: 'AI Photos' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Flagged Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            Loading community flagged items...
          </div>
        ) : filteredFlags.length === 0 ? (
          <div className="p-12 text-center bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No flagged content matches your filter query.
            </p>
            <button
              onClick={onOpenFlagModal}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Be the first to flag a suspicious post
            </button>
          </div>
        ) : (
          filteredFlags.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover-popup"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getSeverityBadge(item.severity)}`}>
                    {item.severity} Severity
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 uppercase">
                    {item.contentType.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {item.id}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Consensus:</span>
                  <button
                    onClick={() => handleVote(item.id, 'up')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all"
                    title="Upvote flag accuracy"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{item.upvotes}</span>
                  </button>

                  <button
                    onClick={() => handleVote(item.id, 'down')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all"
                    title="Downvote false report"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{item.downvotes}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {item.contentTitle}
                </h3>
                {item.contentUrl && (
                  <a
                    href={item.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium line-clamp-1"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {item.contentUrl}
                  </a>
                )}
              </div>

              {/* Uploaded Media or Text Content Attachment */}
              {item.mediaUrl && item.contentType === 'IMAGE_DEEPFAKE' && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/5 max-h-56 flex items-center justify-center p-1">
                  <img
                    src={item.mediaUrl}
                    alt={item.contentTitle}
                    className="max-h-52 w-auto object-contain rounded-lg"
                  />
                </div>
              )}

              {item.mediaUrl && item.contentType === 'VOICE_CLONE' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Mic className="w-3.5 h-3.5 text-purple-500" />
                    <span>Attached Audio Clip ({item.mediaName || 'Voice sample'})</span>
                  </div>
                  <audio controls src={item.mediaUrl} className="w-full h-8 rounded-lg" />
                </div>
              )}

              {item.mediaUrl && item.contentType === 'VIDEO_DEEPFAKE' && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black max-h-56 flex items-center justify-center">
                  <video
                    controls
                    src={item.mediaUrl}
                    className="max-h-56 w-full object-contain"
                  />
                </div>
              )}

              {item.textContent && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap">
                  <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    Attached Text Content:
                  </span>
                  {item.textContent}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Community Reporter Notes</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{item.userReason}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Reporter: <strong className="text-slate-800 dark:text-slate-200">{item.flaggedBy}</strong></span>
                {item.aiVerificationScore && (
                  <span className="text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                    AI Risk Alignment: {item.aiVerificationScore}%
                  </span>
                )}
                <span>Reported: {new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
