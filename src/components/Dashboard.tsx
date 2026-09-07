import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Video,
  Mic,
  Image as ImageIcon,
  Share2,
  RefreshCw,
  Zap,
  ArrowRight,
  Eye,
  BarChart2,
  Calendar,
  Flame,
  Globe,
  Bot,
  Newspaper,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  Layers,
  Landmark,
  DollarSign,
  Sparkles,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { DashboardStats, FlaggedItem, LinkAnalysisResult, DeepfakeAnalysisResult } from '../types';
import { TrustGauge } from './TrustGauge';
import { VisionCard } from './VisionCard';
import { CardSkeleton } from './SkeletonLoader';
import { EarthGlobeVisualization } from './EarthGlobeVisualization';
import { RecentSearchesSection } from './RecentSearchesSection';

interface DashboardProps {
  onNavigateToTab: (tab: 'link' | 'category' | 'deepfake' | 'flagged') => void;
  onOpenFlagModal: () => void;
}

interface FakeNewsCategoryItem {
  categoryName: string;
  count: number;
  percentage: number;
  color: string;
  bgGradient: string;
  icon: React.ElementType;
  description: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE';
}

interface TrendingFakeNews {
  id: string;
  claim: string;
  category: string;
  viralHeat: number;
  platform: string;
  debunkSummary: string;
  verifiedStatus: 'DEBUNKED' | 'HIGH RISK' | 'UNDER AUDIT';
  time: string;
}

interface VerifiedArticle {
  id: string;
  title: string;
  source: string;
  credibilityScore: number;
  category: string;
  publishedAt: string;
  url: string;
  verdict: 'VERIFIED TRUE' | 'MOSTLY ACCURATE';
}

interface AIActivityLog {
  id: string;
  action: string;
  target: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FLAGGED';
  timestamp: string;
  iconType: 'link' | 'audio' | 'video' | 'news';
}

const DEFAULT_STATS: DashboardStats = {
  totalAnalyzed: 206,
  flaggedCount: 43,
  verifiedCount: 86,
  averageCredibilityScore: 82,
  highRiskDeepfakesCount: 20,
  breakdownByCategory: {
    socialLinks: 112,
    imageDeepfakes: 33,
    voiceClones: 39,
    videoDeepfakes: 22
  },
  threatDistribution: [
    { name: 'AI Voice Cloning', value: 19, color: '#f59e0b' },
    { name: 'Synthetic Video / Lipsync', value: 11, color: '#ef4444' },
    { name: 'Social Disinfo Links', value: 54, color: '#ec4899' },
    { name: 'Generative AI Images', value: 16, color: '#8b5cf6' }
  ],
  recentTrends: [
    { date: 'Sep 01', totalScans: 28, flaggedThreats: 10, averageRisk: 60 },
    { date: 'Sep 02', totalScans: 36, flaggedThreats: 14, averageRisk: 65 },
    { date: 'Sep 03', totalScans: 48, flaggedThreats: 22, averageRisk: 72 },
    { date: 'Sep 04', totalScans: 42, flaggedThreats: 17, averageRisk: 68 },
    { date: 'Sep 05', totalScans: 58, flaggedThreats: 26, averageRisk: 77 },
    { date: 'Sep 06', totalScans: 69, flaggedThreats: 32, averageRisk: 83 },
    { date: 'Sep 07', totalScans: 82, flaggedThreats: 43, averageRisk: 86 }
  ]
};

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab, onOpenFlagModal }) => {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [recentFlags, setRecentFlags] = useState<FlaggedItem[]>([]);
  const [recentLinks, setRecentLinks] = useState<LinkAnalysisResult[]>([]);
  const [recentDeepfakes, setRecentDeepfakes] = useState<DeepfakeAnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'high_risk'>('all');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Animated Fake News Categories Data
  const [fakeNewsCategories, setFakeNewsCategories] = useState<FakeNewsCategoryItem[]>([
    {
      categoryName: 'Political Disinformation & Elections',
      count: 186,
      percentage: 42,
      color: '#e11d48',
      bgGradient: 'from-rose-500 to-pink-600',
      icon: Landmark,
      description: 'Manipulated campaign speeches, false voting procedures, and electoral hoaxes.',
      riskLevel: 'CRITICAL'
    },
    {
      categoryName: 'Financial & Market Manipulation',
      count: 124,
      percentage: 28,
      color: '#f59e0b',
      bgGradient: 'from-amber-500 to-yellow-600',
      icon: DollarSign,
      description: 'Deepfake CEO audio clips, fake stock crashes, and cryptocurrency scams.',
      riskLevel: 'HIGH'
    },
    {
      categoryName: 'Generative AI & Synthetic Media',
      count: 80,
      percentage: 18,
      color: '#8b5cf6',
      bgGradient: 'from-purple-500 to-indigo-600',
      icon: Sparkles,
      description: 'FLUX/Midjourney synthetic explosion photos and lip-synced video edits.',
      riskLevel: 'HIGH'
    },
    {
      categoryName: 'Health & Medical Hoaxes',
      count: 35,
      percentage: 8,
      color: '#06b6d4',
      bgGradient: 'from-cyan-500 to-teal-600',
      icon: HeartPulse,
      description: 'Unverified medical cures, miracle claims, and vaccine disinformation.',
      riskLevel: 'ELEVATED'
    },
    {
      categoryName: 'Celebrity & Identity Impersonation',
      count: 18,
      percentage: 4,
      color: '#3b82f6',
      bgGradient: 'from-blue-500 to-cyan-600',
      icon: UserCheck,
      description: 'Unauthorized voice clones promoting phishing links and fraudulent giveaways.',
      riskLevel: 'MODERATE'
    }
  ]);

  // Live Simulated Stream Data
  const [trendingNews, setTrendingNews] = useState<TrendingFakeNews[]>([
    {
      id: 'tf-1',
      claim: 'Fake Audio Clip of Central Bank Governor Leaked Predicting Market Crash',
      category: 'Financial Deepfake',
      viralHeat: 94,
      platform: 'X / Telegram',
      debunkSummary: 'AI Voice Synth frequency match 98% with ElevenLabs model.',
      verifiedStatus: 'DEBUNKED',
      time: '12m ago'
    },
    {
      id: 'tf-2',
      claim: 'AI-Generated Image of Burning Historic Landmark Goes Viral',
      category: 'Generative GAN',
      viralHeat: 89,
      platform: 'TikTok / Reddit',
      debunkSummary: 'Diffusion grid noise artifacts detected in background reflections.',
      verifiedStatus: 'HIGH RISK',
      time: '34m ago'
    },
    {
      id: 'tf-3',
      claim: 'Sensational Clickbait URL Claiming Miracle Medical Cure Discovered',
      category: 'Medical Clickbait',
      viralHeat: 76,
      platform: 'Facebook',
      debunkSummary: 'Domain registered 3 days ago with WHOIS privacy masking.',
      verifiedStatus: 'UNDER AUDIT',
      time: '1h ago'
    }
  ]);

  const [verifiedArticles] = useState<VerifiedArticle[]>([
    {
      id: 'va-1',
      title: 'Global Climate Summit Reaches Binding Agreement on Renewable Targets',
      source: 'Reuters Wire',
      credibilityScore: 98,
      category: 'Environment',
      publishedAt: '25m ago',
      url: 'https://reuters.com',
      verdict: 'VERIFIED TRUE'
    },
    {
      id: 'va-2',
      title: 'Central Bank Maintains Benchmark Interest Rates Amid Cooling Inflation',
      source: 'Associated Press',
      credibilityScore: 96,
      category: 'Economy',
      publishedAt: '1h ago',
      url: 'https://apnews.com',
      verdict: 'VERIFIED TRUE'
    },
    {
      id: 'va-3',
      title: 'International Space Station Completes Orbital Debris Avoidance Maneuver',
      source: 'Agence France-Presse',
      credibilityScore: 95,
      category: 'Science',
      publishedAt: '2h ago',
      url: 'https://afp.com',
      verdict: 'MOSTLY ACCURATE'
    }
  ]);

  const [aiActivityLogs, setAiActivityLogs] = useState<AIActivityLog[]>([
    {
      id: 'log-1',
      action: 'Spectral Acoustic Audio Check',
      target: 'viral_voice_clip_092.mp3',
      status: 'FLAGGED',
      timestamp: 'Just now',
      iconType: 'audio'
    },
    {
      id: 'log-2',
      action: 'WHOIS & Domain Age Indexing',
      target: 'news-breaking-fast.net',
      status: 'COMPLETED',
      timestamp: '2m ago',
      iconType: 'link'
    },
    {
      id: 'log-3',
      action: 'Optic Flow Video Frame Analysis',
      target: 'press_conference_edit.mp4',
      status: 'IN_PROGRESS',
      timestamp: '4m ago',
      iconType: 'video'
    },
    {
      id: 'log-4',
      action: 'Cross-Referencing Wire Services',
      target: 'Reuters & AP Fact-Check',
      status: 'COMPLETED',
      timestamp: '7m ago',
      iconType: 'news'
    }
  ]);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        safeFetchJson<DashboardStats>('/api/dashboard/stats'),
        safeFetchJson<{
          flaggedItems?: FlaggedItem[];
          linkReports?: LinkAnalysisResult[];
          deepfakeReports?: DeepfakeAnalysisResult[];
        }>('/api/reports')
      ]);

      if (statsData) {
        setStats(statsData);
      }

      if (reportsData) {
        if (reportsData.flaggedItems) setRecentFlags(reportsData.flaggedItems);
        if (reportsData.linkReports) setRecentLinks(reportsData.linkReports);
        if (reportsData.deepfakeReports) setRecentDeepfakes(reportsData.deepfakeReports);
      }
    } catch {
      // Fallback gracefully without throwing unhandled exceptions
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Dynamically update category counts and bar percentages whenever reports or stats change
  useEffect(() => {
    const politicalCount = 186 + recentFlags.filter(f => f.category === 'ELECTION_DISINFO').length + recentLinks.filter(l => (l.summary || '').toLowerCase().includes('election') || (l.title || '').toLowerCase().includes('political')).length;
    const financialCount = 124 + recentFlags.filter(f => f.category === 'FINANCIAL_SCAM').length + recentLinks.filter(l => (l.summary || '').toLowerCase().includes('bank') || (l.summary || '').toLowerCase().includes('gold') || (l.summary || '').toLowerCase().includes('financial')).length;
    const genAiCount = 80 + recentDeepfakes.filter(d => d.mediaType === 'image' || d.mediaType === 'video').length;
    const healthCount = 35 + recentFlags.filter(f => f.category === 'MEDICAL_HOAX').length + recentLinks.filter(l => (l.summary || '').toLowerCase().includes('health') || (l.summary || '').toLowerCase().includes('cure')).length;
    const celebCount = 18 + recentDeepfakes.filter(d => d.mediaType === 'audio').length + recentFlags.filter(f => f.category === 'VOICE_CLONE').length;

    const totalCategorySum = politicalCount + financialCount + genAiCount + healthCount + celebCount || 1;

    setFakeNewsCategories([
      {
        categoryName: 'Political Disinformation & Elections',
        count: politicalCount,
        percentage: Math.round((politicalCount / totalCategorySum) * 100),
        color: '#e11d48',
        bgGradient: 'from-rose-500 to-pink-600',
        icon: Landmark,
        description: 'Manipulated campaign speeches, false voting procedures, and electoral hoaxes.',
        riskLevel: 'CRITICAL'
      },
      {
        categoryName: 'Financial & Market Manipulation',
        count: financialCount,
        percentage: Math.round((financialCount / totalCategorySum) * 100),
        color: '#f59e0b',
        bgGradient: 'from-amber-500 to-yellow-600',
        icon: DollarSign,
        description: 'Deepfake CEO audio clips, fake stock crashes, and cryptocurrency scams.',
        riskLevel: 'HIGH'
      },
      {
        categoryName: 'Generative AI & Synthetic Media',
        count: genAiCount,
        percentage: Math.round((genAiCount / totalCategorySum) * 100),
        color: '#8b5cf6',
        bgGradient: 'from-purple-500 to-indigo-600',
        icon: Sparkles,
        description: 'FLUX/Midjourney synthetic explosion photos and lip-synced video edits.',
        riskLevel: 'HIGH'
      },
      {
        categoryName: 'Health & Medical Hoaxes',
        count: healthCount,
        percentage: Math.round((healthCount / totalCategorySum) * 100),
        color: '#06b6d4',
        bgGradient: 'from-cyan-500 to-teal-600',
        icon: HeartPulse,
        description: 'Unverified medical cures, miracle claims, and vaccine disinformation.',
        riskLevel: 'ELEVATED'
      },
      {
        categoryName: 'Celebrity & Identity Impersonation',
        count: celebCount,
        percentage: Math.round((celebCount / totalCategorySum) * 100),
        color: '#3b82f6',
        bgGradient: 'from-blue-500 to-cyan-600',
        icon: UserCheck,
        description: 'Unauthorized voice clones promoting phishing links and fraudulent giveaways.',
        riskLevel: 'MODERATE'
      }
    ]);
  }, [recentLinks, recentDeepfakes, recentFlags, stats]);

  useEffect(() => {
    fetchData(true);

    // Auto-sync interval every 5 seconds to update bars, graphs, and scan counts live
    const syncInterval = setInterval(() => {
      fetchData(false);
    }, 5000);

    // Live AI Activity Stream Simulation
    const interval = setInterval(() => {
      const actions = [
        'Linguistic Sentiment Analysis',
        'Optical Flow Frame Extraction',
        'Acoustic Waveform Frequency Sweep',
        'Domain WHOIS Integrity Scan',
        'Cross-Referencing Global Fact-Check API'
      ];
      const targets = [
        'deepfake_speech_val.wav',
        'breaking-truth-feed.com',
        'social_media_video_hd.mp4',
        'clickbait_claim_link.org'
      ];
      const statuses: Array<'COMPLETED' | 'IN_PROGRESS' | 'FLAGGED'> = ['COMPLETED', 'COMPLETED', 'FLAGGED'];
      const iconTypes: Array<'link' | 'audio' | 'video' | 'news'> = ['link', 'audio', 'video', 'news'];

      const newLog: AIActivityLog = {
        id: `log-${Date.now()}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: 'Just now',
        iconType: iconTypes[Math.floor(Math.random() * iconTypes.length)]
      };

      setAiActivityLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    }, 6000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(interval);
    };
  }, []);

  const getFilteredTrends = () => {
    if (!stats || !stats.recentTrends) return [];
    if (timeRange === '24h') return stats.recentTrends.slice(-2);
    if (timeRange === '7d') return stats.recentTrends;
    return stats.recentTrends;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Live Widget 1: 📈 TRUST SCORE & Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Interactive Trust Score Gauge Card */}
        <VisionCard glowColor="blue" className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Trust Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats ? `${stats.averageCredibilityScore}%` : '82%'}
              </h3>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">↑ +4.2%</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">High Domain Integrity</p>
          </div>
          <TrustGauge score={stats?.averageCredibilityScore || 82} type="credibility" size="sm" showDetails={false} />
        </VisionCard>

        {/* Total Scans Card */}
        <VisionCard glowColor="blue" className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Daily Scans Run</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats ? stats.totalAnalyzed.toLocaleString() : '1,420'}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Media & Web Links</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Live Engine</span>
          </div>
        </VisionCard>

        {/* High Risk Flags */}
        <VisionCard glowColor="rose" className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">High-Risk Threat Flags</p>
            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats ? stats.flaggedCount : '48'}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Community Audited</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">Active Alerts</span>
          </div>
        </VisionCard>

        {/* Deepfakes Detected */}
        <VisionCard glowColor="purple" className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Deepfakes Identified</p>
            <h3 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {stats ? stats.highRiskDeepfakesCount : '21'}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Voice & Video Clones</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">GAN Detectors</span>
          </div>
        </VisionCard>

      </section>

      {/* Main Row: Live Widget 2 (🔥 Trending Fake News) */}
      <section className="w-full">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Trending Disinformation Claims
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Viral fake news items tracked across social platforms
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase">
              Live Heat
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingNews.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {item.platform} • {item.time}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-extrabold">
                      🔥 {item.viralHeat}% Heat
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  "{item.claim}"
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <strong>Forensic Finding:</strong> {item.debunkSummary}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {item.verifiedStatus}
                  </span>
                  <button
                    onClick={() => onNavigateToTab('link')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Run Full Audit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Recent Verification Searches & Trust Scores */}
      <RecentSearchesSection
        title="Recent Verification Searches & Trust Scores"
        subtitle="Live chronological history of audited queries, links, and evaluated credibility scores"
        onSelectSearch={(item) => {
          if (item.type === 'link') {
            onNavigateToTab('link');
          } else if (item.type === 'news') {
            onNavigateToTab('category');
          } else if (item.type === 'deepfake') {
            onNavigateToTab('deepfake');
          } else {
            onNavigateToTab('link');
          }
        }}
      />

      {/* Middle Row: Live Widget 4 (🤖 AI ACTIVITY STREAM) & Live Widget 5 (📊 DAILY ANALYSIS COUNT) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Widget 4: 🤖 AI ACTIVITY STREAM LOG */}
        <div className="lg:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  Real-Time AI Activity Stream
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Background forensic sub-routine logs
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-3">
            {aiActivityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {log.action}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      {log.target}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase shrink-0 ${
                    log.status === 'FLAGGED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : log.status === 'IN_PROGRESS'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Widget 5: 📊 DAILY ANALYSIS COUNT CHART */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Daily Analysis Count & Mitigation Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily volume of scanned media vs mitigated high-risk claims
              </p>
            </div>

            {/* Time-Range Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '24h'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                24H
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '7d'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '30d'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                30D
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {stats && stats.recentTrends ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getFilteredTrends()}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                    labelStyle={{ color: '#93c5fd', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalScans"
                    name="Daily Scans"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="flaggedThreats"
                    name="Flagged Threats"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorThreats)"
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <CardSkeleton />
            )}
          </div>
        </div>

      </section>

      {/* Bottom Row: 📰 LATEST VERIFIED ARTICLES & 🌍 WORLD DISINFORMATION RADAR MAP */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Live Widget 6: 📰 LATEST VERIFIED ARTICLES */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Latest Verified News Wire Articles
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cross-verified breaking reports from Reuters, AP & AFP
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase">
              Credibility 95%+
            </span>
          </div>

          <div className="space-y-3">
            {verifiedArticles.map((article) => (
              <div
                key={article.id}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                      {article.source} • {article.publishedAt}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                      {article.credibilityScore}% Trust Score
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {article.title}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      ✓ {article.verdict}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Source Wire <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. WORLD DISINFORMATION RADAR MAP */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  World Disinformation Radar Map
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  3D Geographic tracking of global fake news hot spots
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase">
              Global Stream
            </span>
          </div>

          {/* Render 3D Globe Radar Map Component */}
          <EarthGlobeVisualization />
        </div>

      </section>

    </div>
  );
};

