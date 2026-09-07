import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Sliders,
  ChevronDown,
  ChevronUp,
  Headphones,
  Eye,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { DeepfakeAnalysisResult } from '../types';

interface AIVoiceNarrationCardProps {
  result: DeepfakeAnalysisResult;
  autoPlay?: boolean;
}

interface NarratorVoiceOption {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  pitch: number;
  rate: number;
}

const NARRATOR_VOICES: NarratorVoiceOption[] = [
  { 
    id: 'Eleanor', 
    name: 'Eleanor', 
    tagline: 'Warm & Natural', 
    desc: 'Calm, comforting spoken cadence with natural warmth',
    pitch: 1.15,
    rate: 0.95
  },
  { 
    id: 'Clara', 
    name: 'Clara', 
    tagline: 'Clear & Articulate', 
    desc: 'Crisp, articulate, and natural explanatory tone',
    pitch: 1.12,
    rate: 0.96
  },
  { 
    id: 'Serena', 
    name: 'Serena', 
    tagline: 'Soft & Gentle', 
    desc: 'Soft-spoken, gentle, and peaceful narration',
    pitch: 1.10,
    rate: 0.94
  },
  { 
    id: 'Victoria', 
    name: 'Victoria', 
    tagline: 'Polished & Focused', 
    desc: 'Smooth, polished, and balanced descriptive tone',
    pitch: 1.14,
    rate: 0.96
  }
];

// Helper to determine if a browser voice is female
const isFemaleVoice = (voice: SpeechSynthesisVoice): boolean => {
  const name = voice.name.toLowerCase();
  const maleIndicators = [
    'male', 'david', 'george', 'daniel', 'alex', 'guy', 'mark', 'james',
    'ryan', 'richard', 'tom', 'brian', 'fred', 'ralph', 'albert', 'junior',
    'oliver', 'william', 'thomas', 'neural2-m', 'neural2-d', 'wavenet-d',
    'wavenet-b', 'google uk english male'
  ];
  if (maleIndicators.some(m => name.includes(m))) {
    return false;
  }

  const femaleIndicators = [
    'female', 'woman', 'lady', 'samantha', 'zira', 'jenny', 'aria', 'victoria',
    'karen', 'moira', 'tessa', 'fiona', 'veena', 'ava', 'allison', 'susan',
    'michelle', 'sonia', 'libby', 'serena', 'zoe', 'kate', 'cathy', 'stephanie',
    'hazel', 'natural (female)', 'neural2-f', 'wavenet-f', 'standard-f',
    'google uk english female', 'sfg#female'
  ];
  return femaleIndicators.some(f => name.includes(f));
};

// Select the most natural lady voice from available system voices
const selectNaturalLadyVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;

  // Priority 1: High fidelity natural female voices (Google, Microsoft, Apple)
  const highQualityFemale = voices.find(v => {
    const n = v.name.toLowerCase();
    const l = v.lang.toLowerCase();
    return l.startsWith('en') && (
      (n.includes('google') && (n.includes('female') || n.includes('us english') || n.includes('uk english female'))) ||
      n.includes('natural (female)') ||
      n.includes('jenny') ||
      n.includes('aria') ||
      n.includes('samantha') ||
      n.includes('ava')
    );
  });
  if (highQualityFemale) return highQualityFemale;

  // Priority 2: Standard natural female voices
  const naturalFemale = voices.find(v => {
    const n = v.name.toLowerCase();
    const l = v.lang.toLowerCase();
    return l.startsWith('en') && (
      n.includes('serena') ||
      n.includes('sonia') ||
      n.includes('libby') ||
      n.includes('victoria') ||
      n.includes('zira') ||
      n.includes('karen')
    );
  });
  if (naturalFemale) return naturalFemale;

  // Priority 3: Any English voice with female markers
  const anyFemaleEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en') && isFemaleVoice(v));
  if (anyFemaleEnglish) return anyFemaleEnglish;

  // Priority 4: Any female voice
  const anyFemale = voices.find(v => isFemaleVoice(v));
  if (anyFemale) return anyFemale;

  // Priority 5: Fallback to first English voice
  const anyEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  return anyEnglish || voices[0] || null;
};

// Formats the script so it directly describes the picture according to the forensic result,
// completely eliminating any bot greetings ("Hi there! I'm Gemini...", "I took a close look...", etc.)
export const formatPictureDescription = (raw: string | undefined, result: DeepfakeAnalysisResult): string => {
  let text = (raw || '').trim();

  // Strip out bot greetings, AI personas, and chatty introductory filler
  text = text
    .replace(/^Hi\s+there!?,?\s*I'm\s+Gemini[^.!?]*[.!?]\s*/i, '')
    .replace(/^Hello!?,?\s*I'm\s+Gemini[^.!?]*[.!?]\s*/i, '')
    .replace(/^Hey\s+there!?,?\s*I'm\s+Gemini[^.!?]*[.!?]\s*/i, '')
    .replace(/^Hello,?\s*I\s+am\s+Dr\.[^.]+\.\s*/i, '')
    .replace(/^Hello!\s*Here\s+is\s+what\s+Gemini\s+AI\s+found[^.!?]*[.!?]\s*/i, '')
    .replace(/^I've\s+taken\s+a\s+(close|careful)\s+look\s+at\s+this[^.!?]*[.!?]\s*/i, '')
    .replace(/^I\s+took\s+a\s+(close|careful|sweet)\s+look\s+at\s+this[^.!?]*[.!?]\s*/i, '')
    .replace(/^After\s+conducting\s+a\s+thorough\s+forensic\s+analysis,?\s*/i, '')
    .replace(/I\s+hope\s+that\s+helps\s+clear\s+things\s+up!?/gi, '')
    .replace(/I'm\s+here\s+to\s+help\s+you\s+stay\s+safe,?\s*/gi, '')
    .replace(/You're\s+wonderful\s+to\s+check,?\s*and\s*/gi, '')
    .trim();

  // If text starts with "It's a...", rewrite smoothly to "This picture is..."
  if (/^it's\s+a\s+/i.test(text)) {
    text = text.replace(/^it's\s+a\s+/i, 'This picture is a ');
  } else if (/^it\s+is\s+a\s+/i.test(text)) {
    text = text.replace(/^it\s+is\s+a\s+/i, 'This picture is a ');
  }

  // Ensure it starts directly with a description of the picture if text was too brief or stripped
  const mediaLabel = result.mediaType === 'image' ? 'picture' : result.mediaType === 'audio' ? 'audio recording' : 'video clip';
  const prob = result.deepfakeProbability;
  const isFake = prob >= 50 || result.verdict !== 'AUTHENTIC';

  if (!text || text.length < 25) {
    const subject = result.title && !result.title.includes('Report') && !result.title.includes('Deepfake')
      ? result.title.replace(/^Forensic Analysis of\s+/i, '')
      : mediaLabel;

    if (isFake) {
      const topArtifact = result.artifacts?.[0]?.title || result.forensicBreakdown?.[0] || 'synthetic lighting and surface texture smoothing';
      return `This ${mediaLabel} exhibits an ${prob}% probability of synthetic AI generation. Forensic examination detects telltale visual markers of generative synthesis, notably ${topArtifact}. The absence of genuine camera sensor noise and natural optical reflections confirms it is a computer-generated creation rather than an authentic photograph.`;
    } else {
      return `This ${mediaLabel} is verified as authentic physical capture with an AI risk of only ${prob}%. The natural camera sensor noise patterns, coherent ambient lighting reflections, and organic focal depth confirm genuine real-world photography.`;
    }
  }

  // Ensure the description starts cleanly with reference to the picture/media
  if (!/^(this\s+(picture|photo|image|recording|video|sample)|forensic\s+analysis)/i.test(text)) {
    text = `This ${mediaLabel}: ${text}`;
  }

  return text;
};

export const AIVoiceNarrationCard: React.FC<AIVoiceNarrationCardProps> = ({
  result,
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem('truthguard_narrator_voice') || 'Eleanor';
  });
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const lastPlayedResultIdRef = useRef<string | null>(null);

  const isFake = result.deepfakeProbability >= 50 || result.verdict !== 'AUTHENTIC';

  // Load and listen for browser speech synthesis voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setSystemVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    try {
      localStorage.setItem('truthguard_narrator_voice', voiceId);
    } catch {
      // ignore
    }
    if (isPlaying) {
      stopSpeech();
      setTimeout(() => startSpeech(activeScript, voiceId), 150);
    }
  };

  // Direct picture description according to forensic results
  const activeScript = formatPictureDescription(result.easyExplanation?.audioScript, result);

  // Split script into sentences for real-time visual tracking
  useEffect(() => {
    const s = activeScript
      .split(/(?<=[.!?])\s+/)
      .map(str => str.trim())
      .filter(str => str.length > 0);
    sentencesRef.current = s;
    setCurrentSentenceIndex(-1);
  }, [activeScript]);

  // Handle auto-play if explicitly enabled
  useEffect(() => {
    if (autoPlay && activeScript && lastPlayedResultIdRef.current !== result.id) {
      lastPlayedResultIdRef.current = result.id;
      const timer = setTimeout(() => {
        startSpeech(activeScript);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, activeScript, result.id]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const startSpeech = (text: string, voiceIdOverride?: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }

    const currentVoiceId = voiceIdOverride || selectedVoice;
    const voiceConfig = NARRATOR_VOICES.find(v => v.id === currentVoiceId) || NARRATOR_VOICES[0];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.pitch = voiceConfig.pitch;
    utterance.rate = voiceConfig.rate;
    utterance.volume = isMuted ? 0 : 1;

    // Pick best matching natural lady voice
    const available = systemVoices.length > 0 ? systemVoices : window.speechSynthesis.getVoices();
    const naturalLadyVoice = selectNaturalLadyVoice(available);
    if (naturalLadyVoice) {
      utterance.voice = naturalLadyVoice;
    }

    const sentences = sentencesRef.current;

    utterance.onboundary = (event) => {
      if (event.name === 'sentence' || event.name === 'word') {
        const charIdx = event.charIndex;
        let runningLength = 0;
        for (let i = 0; i < sentences.length; i++) {
          runningLength += sentences[i].length + 1;
          if (charIdx < runningLength) {
            setCurrentSentenceIndex(i);
            break;
          }
        }
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentSentenceIndex(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis event notice:', e);
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentSentenceIndex(-1);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      startSpeech(activeScript);
    }
  };

  const handleReplay = () => {
    stopSpeech();
    startSpeech(activeScript);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentVoiceObj = NARRATOR_VOICES.find(v => v.id === selectedVoice) || NARRATOR_VOICES[0];
  const mediaTypeName = result.mediaType === 'image' ? 'Picture' : result.mediaType === 'audio' ? 'Audio' : 'Video';

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md relative overflow-hidden ${
      isFake
        ? 'bg-gradient-to-br from-purple-950/30 via-slate-900/90 to-slate-950 border-purple-500/30 text-slate-100 shadow-purple-950/20'
        : 'bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-950 border-emerald-500/30 text-slate-100 shadow-emerald-950/20'
    }`}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-4 relative z-10">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl text-white shadow-md flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 animate-pulse ring-4 ring-blue-500/20' 
                : 'bg-slate-800 border border-slate-700 text-blue-400'
            }`}>
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  Audio Description & Forensic Analysis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 uppercase tracking-wide">
                  Spoken Narration
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Spoken description of the {mediaTypeName.toLowerCase()} according to forensic diagnostic results
              </p>
            </div>
          </div>

          {/* Voice Settings & Copy */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-bold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
              title="Voice Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Voice: {currentVoiceObj.name}</span>
              {showVoiceSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition-colors"
              title="Copy Audio Description Transcript"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Voice Selector Row */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 pb-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-blue-400" />
            Narrator Voice:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {NARRATOR_VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVoice(v.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedVoice === v.id
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/25'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700/80 hover:bg-slate-700/80 hover:text-white'
                }`}
                title={`${v.name} - ${v.desc}`}
              >
                <span>{v.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                  selectedVoice === v.id ? 'bg-black/25 text-blue-100' : 'bg-slate-700 text-slate-400'
                }`}>
                  {v.tagline.split('&')[0]?.trim()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector Drawer */}
        {showVoiceSettings && (
          <div className="p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Select Spoken Narrator Voice</span>
              <span className="text-[11px] text-slate-400">Natural lady voices tuned for clear, articulate spoken descriptions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {NARRATOR_VOICES.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVoice(v.id)}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    selectedVoice === v.id
                      ? 'bg-gradient-to-br from-blue-900/40 via-slate-800 to-slate-900 border-blue-500/80 shadow-md ring-2 ring-blue-500/25'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{v.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {v.tagline}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 leading-snug">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Voice Player Controls Banner */}
        <div className="p-4 rounded-xl bg-slate-950/85 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Main Play / Pause Button & Status */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={togglePlayPause}
              className={`p-3.5 rounded-full text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 ring-4 ring-blue-500/20'
              }`}
              title={isPlaying ? 'Pause Audio' : `Play Audio Description (${currentVoiceObj.name})`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleReplay}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Replay from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {isPlaying ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Speaking: {currentVoiceObj.name} is describing the picture...</span>
                  </>
                ) : (
                  <span>Click Play to Listen to Description</span>
                )}
              </span>
              <p className="text-[11px] text-slate-400 font-medium">
                Voice: {currentVoiceObj.name} ({currentVoiceObj.tagline})
              </p>
            </div>
          </div>

          {/* Sound Wave Animation Bars */}
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800">
            {[40, 75, 30, 90, 50, 85, 35, 95, 60, 45, 80, 55].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying 
                    ? 'bg-gradient-to-t from-blue-400 to-indigo-400 shadow-sm shadow-blue-400/40' 
                    : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(6, (h * ((i % 3) + 1)) % 24 + 6)}px` : '4px',
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`
                }}
              />
            ))}
          </div>

          {/* Mute Button Control */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (utteranceRef.current) {
                  utteranceRef.current.volume = nextMuted ? 0 : 1;
                }
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Live Interactive Readout Box with Sentence Highlighting */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Eye className="w-3.5 h-3.5" />
              AUDIO DESCRIPTION TRANSCRIPT
            </span>
            <span className="text-blue-400 font-mono text-[10px]">
              {isPlaying ? 'Speaking Now' : 'Ready'}
            </span>
          </div>

          <div className="text-sm leading-relaxed text-slate-200 space-y-1.5">
            {sentencesRef.current.map((sentence, idx) => (
              <span
                key={idx}
                onClick={() => {
                  stopSpeech();
                  const remainder = sentencesRef.current.slice(idx).join(' ');
                  startSpeech(remainder);
                  setCurrentSentenceIndex(idx);
                }}
                className={`cursor-pointer transition-all duration-200 px-1 py-0.5 rounded inline ${
                  currentSentenceIndex === idx
                    ? 'bg-blue-600/30 text-blue-100 font-bold border-b-2 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
                title="Click to jump reading to this sentence"
              >
                {sentence}{' '}
              </span>
            ))}
          </div>

          {/* Key Easy-to-Understand Takeaways */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                {isFake ? <ShieldAlert className="w-3 h-3 text-rose-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                1. Detection Result
              </span>
              <p className={`font-bold ${isFake ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isFake ? `AI-Generated Media (${result.deepfakeProbability}%)` : `Authentic Media (${result.deepfakeProbability}% Risk)`}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Visual Evidence</span>
              <p className="text-slate-300 font-medium leading-snug">
                {result.artifacts?.[0]?.title || result.forensicBreakdown?.[0] || (
                  isFake ? 'Synthetic surface textures and unnatural lighting coherence.' : 'Consistent camera PRNU sensor noise and organic optical depth.'
                )}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Practical Assessment</span>
              <p className="text-slate-300 font-medium leading-snug">
                {isFake
                  ? 'Digital artwork or synthesized media rather than an authentic real-world photograph.'
                  : 'Genuine physical capture matching standard camera optics and lighting.'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
