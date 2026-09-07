import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, RefreshCw, ChevronDown, ShieldCheck, Zap } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const PRESET_QUESTIONS = [
  'How do I identify AI voice clones?',
  'What are diffusion image artifacts?',
  'How to check if a news link is clickbait?',
  'What makes a social media account suspicious?'
];

export const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Hello! I am **VeriBot**, your AI Fact-Checking & Deepfake Intelligence assistant. Ask me anything about suspicious links, voice clones, or forensic detection methodologies.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleOrbClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 700);

    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          sender: 'bot',
          text: data.reply || 'Analysis completed.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      const errorMsg: Message = {
        sender: 'bot',
        text: '⚠️ Unable to connect to the VeriBot intelligence engine right now. Please try again shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Drawer Window */}
      {isOpen && (
        <div className="pointer-events-auto w-[92vw] sm:w-[400px] h-[520px] mb-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-white">
                  VeriBot AI Assistant
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time Deepfake & Fact-Checking Guide
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-36 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 whitespace-nowrap transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask VeriBot about a claim or deepfake..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Glowing AI Orb Toggle Button */}
      <button
        onClick={handleOrbClick}
        aria-label="Toggle VeriBot AI Assistant"
        className={`pointer-events-auto group relative flex items-center gap-3 px-4 py-3 rounded-full text-white font-bold text-xs sm:text-sm transition-all overflow-hidden cursor-pointer select-none border border-white/20 backdrop-blur-xl ${
          loading
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 animate-orb-think shadow-[0_0_40px_rgba(236,72,153,0.8)]'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-orb-breathe shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95'
        }`}
      >
        {/* Click Ripple Effect */}
        {ripples.map((r) => (
          <span
            key={r.id}
            style={{ left: r.x, top: r.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-300/60 rounded-full pointer-events-none animate-ripple"
          />
        ))}

        {/* Glowing Orb Core with Inner Swirling Halo */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/40 border border-white/40 shadow-inner overflow-hidden shrink-0">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-fuchsia-500 blur-[2px] ${
              loading ? 'animate-spin' : 'animate-pulse'
            }`}
          />

          {/* Voice Wave Equalizer Animation (Shown when thinking or open) */}
          {loading ? (
            <div className="relative z-10 flex items-center justify-center gap-0.5 h-4">
              <span className="w-0.5 bg-white rounded-full animate-voice-bar-1" />
              <span className="w-0.5 bg-cyan-200 rounded-full animate-voice-bar-2" />
              <span className="w-0.5 bg-amber-200 rounded-full animate-voice-bar-3" />
              <span className="w-0.5 bg-pink-200 rounded-full animate-voice-bar-4" />
            </div>
          ) : (
            <span className="relative z-10 text-base font-extrabold text-white leading-none">
              🧠
            </span>
          )}
        </div>

        {/* Text Label & Status Indicator */}
        <div className="flex flex-col items-start text-left">
          <span className="hidden sm:inline font-black tracking-wide text-xs drop-shadow">
            VeriBot AI
          </span>
          <span className="text-[10px] text-cyan-200 font-mono tracking-wider uppercase font-semibold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-pink-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            {loading ? 'Thinking...' : 'Truth AI'}
          </span>
        </div>

        {/* Toggle Icon */}
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-cyan-200" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        )}
      </button>

    </div>
  );
};
