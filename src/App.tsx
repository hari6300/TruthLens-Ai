import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from './assets/images/truthlens_app_logo_1786111909392.jpg';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LinkAnalyzer } from './components/LinkAnalyzer';
import { DeepfakeAnalyzer } from './components/DeepfakeAnalyzer';
import { NewsDetectionAnalyzer } from './components/NewsDetectionAnalyzer';
import { FlaggedRepo } from './components/FlaggedRepo';
import { FactCheckGuide } from './components/FactCheckGuide';
import { FlagModal } from './components/FlagModal';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ThemeProvider } from './components/ThemeContext';
import { ShieldAlert, Activity } from 'lucide-react';

export default function App() {
  console.log('APP RENDER:', new Date().toISOString());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'link' | 'category' | 'deepfake' | 'flagged' | 'guide'>('dashboard');
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagModalData, setFlagModalData] = useState<{ title?: string; url?: string; category?: string } | null>(null);
  const [pendingFlagsCount, setPendingFlagsCount] = useState(0);

  const updateFlagsCount = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          setPendingFlagsCount(data.flaggedItems?.length || 0);
        }
      }
    } catch {
      // Safe fallback
    }
  };

  useEffect(() => {
    updateFlagsCount();
  }, []);

  const handleOpenFlagModalWithData = (data: { title?: string; url?: string; category?: string }) => {
    setFlagModalData(data);
    setFlagModalOpen(true);
  };

  const handleSearchSelect = (tab: 'dashboard' | 'link' | 'category' | 'deepfake' | 'flagged' | 'guide') => {
    setActiveTab(tab);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-300 relative overflow-x-hidden">
        
        {/* Animated Particle & Mesh Background */}
        <AnimatedBackground />

        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenFlagModal={() => {
            setFlagModalData(null);
            setFlagModalOpen(true);
          }}
          pendingFlagsCount={pendingFlagsCount}
          onSelectSearchResult={handleSearchSelect}
        />

        {/* Main View Area with AnimatePresence Page Transitions */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onOpenFlagModal={() => {
                    setFlagModalData(null);
                    setFlagModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'link' && (
                <LinkAnalyzer
                  onOpenFlagModalWithData={handleOpenFlagModalWithData}
                />
              )}

              {activeTab === 'category' && (
                <NewsDetectionAnalyzer
                  onOpenFlagModalWithData={handleOpenFlagModalWithData}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'deepfake' && (
                <DeepfakeAnalyzer
                  onOpenFlagModalWithData={handleOpenFlagModalWithData}
                />
              )}

              {activeTab === 'flagged' && (
                <FlaggedRepo
                  onOpenFlagModal={() => {
                    setFlagModalData(null);
                    setFlagModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'guide' && (
                <FactCheckGuide />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Flag Content Modal */}
        <FlagModal
          isOpen={flagModalOpen}
          onClose={() => setFlagModalOpen(false)}
          initialData={flagModalData}
          onFlagSubmitted={updateFlagsCount}
        />

        {/* Floating AI Forensic Assistant */}
        <FloatingAIAssistant />

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6 text-xs text-slate-500 dark:text-slate-400 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src={logoImg}
                alt="TruthLens AI Logo"
                className="w-6 h-6 rounded-md object-cover border border-blue-500/30"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">TruthLens AI</span>
              <span>— Social Media Credibility & Deepfake Forensic Intelligence</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Gemini 3.6 Flash Active
              </span>
              <span>•</span>
              <span>Real-Time Community Threat Reporting</span>
            </div>
          </div>
        </footer>

      </div>
    </ThemeProvider>
  );
}

