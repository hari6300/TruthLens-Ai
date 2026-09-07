import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2,
  Landmark,
  DollarSign,
  Sparkles,
  HeartPulse,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Layers,
  Zap,
  Flame,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip
} from 'recharts';
import { FlaggedItem, LinkAnalysisResult, DeepfakeAnalysisResult, DashboardStats } from '../types';
import { VisionCard } from './VisionCard';

interface CategoryAnalyzerProps {
  onOpenFlagModalWithData?: (data: { title?: string; url?: string; category?: string }) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'link' | 'category' | 'deepfake' | 'flagged') => void;
}

interface FakeNewsCategoryItem {
  id: string;
  categoryName: string;
  count: number;
  percentage: number;
  color: string;
  bgGradient: string;
  icon: React.ElementType;
  description: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE';
  detectionSignatures: string[];
  recentClaims: {
    title: string;
    platform: string;
    heat: number;
    verdict: string;
  }[];
}

export const CategoryAnalyzer: React.FC<CategoryAnalyzerProps> = ({
  onOpenFlagModalWithData,
  onNavigateToTab
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFlags, setRecentFlags] = useState<FlaggedItem[]>([]);
  const [recentLinks, setRecentLinks] = useState<LinkAnalysisResult[]>([]);
  const [recentDeepfakes, setRecentDeepfakes] = useState<DeepfakeAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'high_risk'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('political');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.allSettled([
        fetch('/api/dashboard/stats'),
        fetch('/api/reports')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const ct = statsRes.value.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const statsData = await statsRes.value.json();
          setStats(statsData);
        }
      }

      if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
        const ct = reportsRes.value.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const reportsData = await reportsRes.value.json();
          setRecentFlags(reportsData.flaggedItems || []);
          setRecentLinks(reportsData.linkReports || []);
          setRecentDeepfakes(reportsData.deepfakeReports || []);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute dynamic category counts and distributions
  const politicalCount = 186 + recentFlags.filter(f => f.category === 'ELECTION_DISINFO').length + recentLinks.filter(l => (l.summary || '').toLowerCase().includes('election') || (l.title || '').toLowerCase().includes('political')).length;
  const financialCount = 124 + recentFlags.filter(f => f.category === 'FINANCIAL_SCAM').length + recentLinks.filter(l => (l.summary || '').toLowerCase().includes('bank') || (l.summary || '').toLowerCase().includes('gold') || (l.summary || '').toLowerCase().includes('financial')).length;
  const genAiCount = 80 + recentDeepfakes.filter(d => d.mediaType === 'image' || d.mediaType === 'video').length;
  const healthCount = 35 + recentFlags.filter(f => f.category === 'MEDICAL_HOAX').length + recentLinks.filter(l => (l.summary || '').toLowerCase().includes('health') || (l.summary || '').toLowerCase().includes('cure')).length;
  const celebCount = 18 + recentDeepfakes.filter(d => d.mediaType === 'audio').length + recentFlags.filter(f => f.category === 'VOICE_CLONE').length;

  const totalCategorySum = politicalCount + financialCount + genAiCount + healthCount + celebCount || 1;

  const fakeNewsCategories: FakeNewsCategoryItem[] = [
    {
      id: 'political',
      categoryName: 'Political Disinformation & Elections',
      count: politicalCount,
      percentage: Math.round((politicalCount / totalCategorySum) * 100),
      color: '#e11d48',
      bgGradient: 'from-rose-500 to-pink-600',
      icon: Landmark,
      description: 'Manipulated campaign speeches, false voting procedures, and electoral hoaxes.',
      riskLevel: 'CRITICAL',
      detectionSignatures: [
        'Lip-sync frame jitter on official press conference broadcasts',
        'Fabricated ballot polling location alteration images',
        'Automated bot network cross-posting across social feeds'
      ],
      recentClaims: [
        { title: 'Manipulated Speech Alleging Election Commission Order Delay', platform: 'Twitter / X', heat: 94, verdict: 'DEBUNKED' },
        { title: 'Fake Mail-In Ballot Procedure Poster Circulating on Messaging Apps', platform: 'WhatsApp', heat: 88, verdict: 'HIGH RISK' }
      ]
    },
    {
      id: 'financial',
      categoryName: 'Financial & Market Manipulation',
      count: financialCount,
      percentage: Math.round((financialCount / totalCategorySum) * 100),
      color: '#f59e0b',
      bgGradient: 'from-amber-500 to-yellow-600',
      icon: DollarSign,
      description: 'Deepfake CEO audio clips, fake stock crashes, and cryptocurrency scams.',
      riskLevel: 'HIGH',
      detectionSignatures: [
        'Acoustic spectral cutoffs above 8kHz in synthetic CEO audio',
        'Cloned corporate news wire sites with masked domain registrations',
        'Pump-and-dump social bot sentiment manipulation'
      ],
      recentClaims: [
        { title: 'AI Voice Clone of Tech Executive Announcing Insolvency', platform: 'Telegram', heat: 91, verdict: 'HIGH RISK' },
        { title: 'Spoofed Central Bank Gold Seizure Notice', platform: 'Facebook', heat: 79, verdict: 'DEBUNKED' }
      ]
    },
    {
      id: 'genai',
      categoryName: 'Generative AI & Synthetic Media',
      count: genAiCount,
      percentage: Math.round((genAiCount / totalCategorySum) * 100),
      color: '#8b5cf6',
      bgGradient: 'from-purple-500 to-indigo-600',
      icon: Sparkles,
      description: 'FLUX/Midjourney synthetic explosion photos and lip-synced video edits.',
      riskLevel: 'HIGH',
      detectionSignatures: [
        'Optical vector reflection inconsistencies in irises and glass',
        'Diffusion noise grid patterns in high-contrast background regions',
        'Inconsistent hand geometry and high-frequency edge blur'
      ],
      recentClaims: [
        { title: 'Generative AI Photo of Explosive Downtown Incident', platform: 'Instagram', heat: 96, verdict: 'DEBUNKED' },
        { title: 'Synthetic Video of Celebrity Endorsing Unregulated Investment', platform: 'YouTube Shorts', heat: 85, verdict: 'HIGH RISK' }
      ]
    },
    {
      id: 'health',
      categoryName: 'Health & Medical Hoaxes',
      count: healthCount,
      percentage: Math.round((healthCount / totalCategorySum) * 100),
      color: '#06b6d4',
      bgGradient: 'from-cyan-500 to-teal-600',
      icon: HeartPulse,
      description: 'Unverified medical cures, miracle claims, and vaccine disinformation.',
      riskLevel: 'ELEVATED',
      detectionSignatures: [
        'Linguistic emotional manipulation score exceeding 85/100',
        'Unverified peer-review citations and domain age under 14 days',
        'Clickbait monetization redirects with fake medical doctor quotes'
      ],
      recentClaims: [
        { title: 'Sensational Article Claiming Instant Miracle Remedy for Chronic Conditions', platform: 'Web Link', heat: 72, verdict: 'UNDER AUDIT' },
        { title: 'Fabricated Medical Association Guidance Warning Notice', platform: 'Facebook Groups', heat: 68, verdict: 'DEBUNKED' }
      ]
    },
    {
      id: 'celeb',
      categoryName: 'Celebrity & Identity Impersonation',
      count: celebCount,
      percentage: Math.round((celebCount / totalCategorySum) * 100),
      color: '#3b82f6',
      bgGradient: 'from-blue-500 to-cyan-600',
      icon: UserCheck,
      description: 'Unauthorized voice clones promoting phishing links and fraudulent giveaways.',
      riskLevel: 'MODERATE',
      detectionSignatures: [
        'Voice clone cadence loops and monotone pitch contours',
        'High-frequency facial boundary warping in video clips',
        'Suspicious Telegram gift / crypto wallet destination links'
      ],
      recentClaims: [
        { title: 'Celebrity Audio Recording Offering Double Crypto Returns', platform: 'TikTok', heat: 82, verdict: 'DEBUNKED' },
        { title: 'Synthetic Video of Sports Figure Claiming Retirement Scam', platform: 'Twitter', heat: 64, verdict: 'HIGH RISK' }
      ]
    }
  ];

  const filteredCategories = fakeNewsCategories.filter(cat => {
    const matchesFilter = categoryFilter === 'all' || cat.riskLevel === 'CRITICAL' || cat.riskLevel === 'HIGH';
    const matchesSearch = !searchQuery.trim() ||
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const currentCategory = fakeNewsCategories.find(c => c.id === selectedCategoryId) || fakeNewsCategories[0];
  const CurrentIcon = currentCategory.icon;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
              <BarChart2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Category Intelligence Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Fake News & Deepfake Breakdown by Category
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time classification of social disinformation, synthetic voice clones, electoral hoaxes, and financial scams categorized by domain severity and threat velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">TOTAL DISINFO FLAGS</span>
              <span className="text-lg font-black text-rose-400">
                {totalCategorySum} Active Cases
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px]">DOMINANT THREAT</span>
              <span className="text-lg font-black text-amber-400">
                Elections & Politics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories, disinfo tropes, or risk tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'all'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            All Categories ({fakeNewsCategories.length})
          </button>

          <button
            onClick={() => setCategoryFilter('high_risk')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'high_risk'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Critical & High Risk Only
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Chart & Horizontal Bars Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Disinformation Distribution & Volume Share
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any category bar or card to open detailed forensic signatures and recent claims
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
            Auto-Updated Live
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recharts Vertical Layout Bar Chart */}
          <div className="lg:col-span-5 h-[360px] w-full bg-slate-50/60 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Category Percentage Share
            </span>
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={filteredCategories}
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    width={180}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={({ x, y, payload }) => {
                      const isHovered = hoveredCategory === payload.value || selectedCategoryId === filteredCategories.find(c => c.categoryName === payload.value)?.id;
                      const catObj = fakeNewsCategories.find(c => c.categoryName === payload.value);
                      return (
                        <g
                          transform={`translate(${x},${y})`}
                          className="cursor-pointer"
                          onClick={() => {
                            if (catObj) setSelectedCategoryId(catObj.id);
                          }}
                          onMouseEnter={() => setHoveredCategory(payload.value)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <text
                            x={-8}
                            y={4}
                            textAnchor="end"
                            fill={isHovered ? (catObj?.color || '#e11d48') : '#94a3b8'}
                            fontWeight={isHovered ? 800 : 600}
                            fontSize={11}
                            className="transition-colors duration-150"
                          >
                            {payload.value.length > 25 ? payload.value.slice(0, 23) + '…' : payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    radius={[0, 8, 8, 0]}
                    isAnimationActive={true}
                    animationDuration={600}
                  >
                    {filteredCategories.map((entry, index) => {
                      const isSelected = selectedCategoryId === entry.id;
                      const isHovered = hoveredCategory === entry.categoryName;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={isHovered || isSelected ? 1 : 0.75}
                          stroke={isSelected || isHovered ? '#ffffff' : 'none'}
                          strokeWidth={isSelected ? 2 : 0}
                          className="transition-all duration-150 cursor-pointer"
                          onClick={() => setSelectedCategoryId(entry.id)}
                          onMouseEnter={() => setHoveredCategory(entry.categoryName)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <span>0% Baseline</span>
              <span>50% Max Domain Share</span>
            </div>
          </div>

          {/* Animated Horizontal Progress Bars List */}
          <div className="lg:col-span-7 space-y-3.5">
            {filteredCategories.map((item) => {
              const CategoryIcon = item.icon;
              const isSelected = selectedCategoryId === item.id;
              const isHovered = hoveredCategory === item.categoryName;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCategoryId(item.id)}
                  onMouseEnter={() => setHoveredCategory(item.categoryName)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-900 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : isHovered
                      ? 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700'
                      : 'bg-slate-50/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="p-2 rounded-lg text-white shadow-sm transition-transform duration-150"
                        style={{ backgroundColor: item.color }}
                      >
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.categoryName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${
                          item.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                            : item.riskLevel === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                            : item.riskLevel === 'ELEVATED'
                            ? 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30'
                            : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                      <div>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                          {item.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                          {item.count} cases
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar Track */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.bgGradient} transition-all duration-300 ease-out shadow-sm relative`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Selected Category Deep Dive Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: currentCategory.color }}
              >
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">
                    {currentCategory.categoryName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold">
                    {currentCategory.riskLevel} SEVERITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {currentCategory.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (onOpenFlagModalWithData) {
                    onOpenFlagModalWithData({
                      title: `Suspicious item in ${currentCategory.categoryName}`,
                      category: currentCategory.categoryName
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag New Item</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Forensic AI Detection Signatures */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>AI Forensic Detection Markers</span>
              </div>
              <ul className="space-y-2.5">
                {currentCategory.detectionSignatures.map((sig, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Recent Claims in this Category */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Viral Claims Under Investigation</span>
              </div>
              <div className="space-y-2.5">
                {currentCategory.recentClaims.map((claim, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">
                        "{claim.title}"
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {claim.platform} • Viral Heat: {claim.heat}%
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                      {claim.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
};
