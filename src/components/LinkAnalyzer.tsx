import React, { useState } from 'react';
import {
  Link2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Share2,
  Flag,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { LinkAnalysisResult } from '../types';
import { TrustGauge } from './TrustGauge';
import { CardSkeleton } from './SkeletonLoader';
import { NeuralScannerModal } from './NeuralScannerModal';
import { SuccessCelebration } from './SuccessCelebration';
import { RecentSearchesSection } from './RecentSearchesSection';
import { saveRecentSearch } from '../utils/recentSearches';

interface LinkAnalyzerProps {

  onOpenFlagModalWithData: (data: { title: string; url?: string; category?: string }) => void;
}

export const LinkAnalyzer: React.FC<LinkAnalyzerProps> = ({ onOpenFlagModalWithData }) => {
  const [url, setUrl] = useState('');
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() && !postText.trim()) {
      setError('Please enter a social media URL or post content text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          postText,
          platform: 'Social Media / Web Link',
          platformAuthor: ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run credibility verification');
      }

      const data: LinkAnalysisResult = await response.json();
      setResult(data);

      // Save the search and calculated trust score
      await saveRecentSearch({
        query: (url || postText).trim(),
        title: data.title || (url ? 'Scanned Link' : 'Scanned Text'),
        trustScore: data.credibilityScore,
        rating: data.rating,
        type: 'link',
        url: url.trim() || undefined,
        category: 'SOCIAL_LINK',
        details: data.summary
      });
    } catch (err: any) {
      console.error('Error analyzing link:', err);
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const text = `TruthLens AI Credibility Audit Report:
Title: ${result.title}
Platform: ${result.platform}
Credibility Score: ${result.credibilityScore}% (${result.rating})
Clickbait Level: ${result.clickbaitScore}%
Summary: ${result.summary}
Recommended Action: ${result.recommendedAction}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRatingCardStyle = (rating: string) => {
    switch (rating) {
      case 'VERIFIED_REAL':
        return 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
      case 'LIKELY_REAL':
        return 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200';
      case 'UNCERTAIN':
        return 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200';
      case 'MISLEADING':
        return 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200';
      case 'HIGHLY_DECEPTIVE':
        return 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200';
      default:
        return 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header Banner - Glassmorphism */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-400">
          <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Social Media Link & Claim Credibility Analyzer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Verify Social Posts & News Links
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Analyze viral social media claims for clickbait framing, emotional manipulation, unverified facts, missing context, and domain authority.
        </p>
      </div>

      {/* Main Analysis Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Social Post URL or Article Link</label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                placeholder="https://x.com/username/status/123456789 or https://news-site.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Post Content / Claim Text (Paste if URL is restricted or private)
            </label>
            <textarea
              rows={3}
              placeholder="Paste the caption, post message, headline, or claim text here..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setPostText('');
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credibility...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Run Credibility Scan</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Neural AI Brain Network Scanner Modal */}
      <NeuralScannerModal isOpen={loading} type="link" />

      {/* Skeleton Shimmer Loading State */}
      {loading && <CardSkeleton />}

      {/* Verification Results View */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Success Celebration Header with Self-drawing Checkmark & Score Counter */}
          <SuccessCelebration
            score={result.credibilityScore}
            rating={result.rating}
            isCredible={result.credibilityScore >= 60}
            title={result.title}
          />

          <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">

          
          {/* Result Header & Animated Trust Score Gauge */}
          <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${getRatingCardStyle(result.rating)}`}>
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-white/80 dark:bg-slate-900/80 border border-current shadow-xs">
                  {result.rating.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-bold opacity-80">
                  Platform: {result.platform}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {result.title}
              </h2>
              <p className="text-xs leading-relaxed opacity-90">
                {result.summary}
              </p>
            </div>

            {/* Animated Trust Gauge */}
            <div className="shrink-0">
              <TrustGauge
                score={result.credibilityScore}
                type="credibility"
                size="lg"
                label="Truth Rating"
              />
            </div>
          </div>

          {/* Metric Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Clickbait Index</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{result.clickbaitScore}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Sensationalism</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${result.clickbaitScore}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Emotional Charge</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{result.emotionalChargeScore}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Outrage Framing</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${result.emotionalChargeScore}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Domain Trust Rating</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.domainTrustScore}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Reputability</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${result.domainTrustScore}%` }} />
              </div>
            </div>
          </div>

          {/* Key Claims Verification Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Claim-by-Claim Fact Checking
            </h3>

            <div className="space-y-3">
              {result.keyClaims.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      "{item.claim}"
                    </p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      item.verdict === 'TRUE'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : item.verdict === 'FALSE'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {item.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.explanation}
                  </p>
                  {item.sourceCitation && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-mono">
                      <ExternalLink className="w-3 h-3" />
                      Ref: {item.sourceCitation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Context & Anomalies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing Context & Omitted Facts
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {result.missingContext.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Detected Linguistic & Behavioral Anomalies
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {result.detectedAnomalies.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Recommended Action & Actions Toolbar */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Recommended Reader Guidance</span>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{result.recommendedAction}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyReport}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Report' : 'Copy Summary'}
              </button>

              <button
                onClick={() => onOpenFlagModalWithData({ title: result.title, url: result.url, category: 'SOCIAL_DISINFO' })}
                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Flag as Fake News
              </button>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Recent Searches & Trust Scores Section */}
      <RecentSearchesSection
        title="Recent Link Audits & Trust Scores"
        subtitle="Review previously evaluated social posts and domain credibility scores"
        onSelectSearch={(item) => {
          if (item.url) {
            setUrl(item.url);
            setPostText('');
          } else {
            setUrl('');
            setPostText(item.query);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );

};
