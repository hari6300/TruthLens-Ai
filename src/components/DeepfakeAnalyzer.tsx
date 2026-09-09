import React, { useState } from 'react';
import {
  Video,
  Mic,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Download,
  Flag,
  Info,
  Layers,
  FileCode,
  Activity,
  X
} from 'lucide-react';
import { DeepfakeAnalysisResult } from '../types';
import { TrustGauge } from './TrustGauge';
import { CardSkeleton } from './SkeletonLoader';
import { NeuralScannerModal } from './NeuralScannerModal';
import { SuccessCelebration } from './SuccessCelebration';
import { VisionCard } from './VisionCard';
import { AIVoiceNarrationCard } from './AIVoiceNarrationCard';
import { saveRecentSearch } from '../utils/recentSearches';

interface DeepfakeAnalyzerProps {
  onOpenFlagModalWithData: (data: { title: string; category?: string }) => void;
}

export const DeepfakeAnalyzer: React.FC<DeepfakeAnalyzerProps> = ({ onOpenFlagModalWithData }) => {
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Preview, setBase64Preview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [contextUrl, setContextUrl] = useState('');
  const [claims, setClaims] = useState('');

  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeepfakeAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const processFile = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setBase64Preview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedFile && !base64Preview && !claims.trim()) {
      setError('Please upload a file or select a preset sample case.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgressStage('Extracting spectral & temporal features...');

    const stageTimer1 = setTimeout(() => {
      setProgressStage('Evaluating neural model artifacts & facial landmarks...');
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      setProgressStage('Executing multimodal forensic image inspection...');
    }, 2400);

    try {
      const response = await fetch('/api/analyze/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType,
          base64Data: base64Preview || undefined,
          mimeType: selectedFile?.type || (mediaType === 'image' ? 'image/png' : mediaType === 'audio' ? 'audio/wav' : 'video/mp4'),
          fileName: fileName || selectedFile?.name || `${mediaType}_scan_file`,
          contextUrl,
          claims
        })
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (!response.ok) {
        throw new Error('Forensic analysis failed on server');
      }

      const data: DeepfakeAnalysisResult = await response.json();
      setResult(data);

      // Save search and calculated authenticity trust score
      const authenticityTrustScore = Math.max(0, 100 - data.deepfakeProbability);
      await saveRecentSearch({
        query: (fileName || selectedFile?.name || claims || data.title).trim(),
        title: data.title,
        trustScore: authenticityTrustScore,
        rating: data.verdict,
        type: 'deepfake',
        category: mediaType.toUpperCase(),
        details: data.executiveSummary || `Deepfake Probability: ${data.deepfakeProbability}%. Detected Model: ${data.primaryModelDetected}`
      });
    } catch (err: any) {
      console.error('Error running deepfake scan:', err);
      setError(err.message || 'An error occurred during forensic media scan.');
    } finally {
      setLoading(false);
      setProgressStage('');
    }
  };

  const getVerdictCardStyle = (verdict: string) => {
    switch (verdict) {
      case 'AUTHENTIC':
        return 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
      case 'SUSPECTED_EDIT':
        return 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200';
      case 'SYNTHETIC_AI':
        return 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200';
      case 'HIGH_RISK_DEEPFAKE':
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
          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Multimodal Deepfake & AI Media Detector</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Detect Fake Videos, Voice Clones & AI Photos
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Inspect uploaded files for generative diffusion patterns, neural voice synthesis cutoffs, facial landmark distortion, and temporal frame glitches.
        </p>
      </div>

      {/* Media Type Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => {
            setMediaType('image');
            setResult(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mediaType === 'image'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>AI Image Deepfake</span>
        </button>

        <button
          onClick={() => {
            setMediaType('audio');
            setResult(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mediaType === 'audio'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice Clone Audio</span>
        </button>

        <button
          onClick={() => {
            setMediaType('video');
            setResult(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mediaType === 'video'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Deepfake Video Clip</span>
        </button>
      </div>

      {/* Main Upload / Inspector Input Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          
          {/* Interactive Drag-and-Drop File Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload {mediaType.toUpperCase()} File for Forensic Inspection
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 overflow-hidden ${
                isDragging
                  ? 'border-blue-500 bg-gradient-to-br from-blue-100/90 via-indigo-50/80 to-blue-50/90 dark:from-blue-950/80 dark:via-indigo-950/60 dark:to-slate-900 scale-[1.02] shadow-2xl shadow-blue-500/25 ring-4 ring-blue-500/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-950/50'
              }`}
            >
              {/* Animated pulse halo when dragging */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none animate-pulse" />
              )}

              <input
                type="file"
                accept={
                  mediaType === 'image'
                    ? 'image/*'
                    : mediaType === 'audio'
                    ? 'audio/*'
                    : 'video/*'
                }
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />

              {base64Preview && mediaType === 'image' ? (
                <div className="relative z-20 w-full my-2 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <img
                    src={base64Preview}
                    alt="Preview"
                    className="max-h-60 w-auto object-contain rounded-xl shadow-md border border-slate-300 dark:border-slate-700"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[250px]">
                      {fileName || 'Uploaded Image'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setBase64Preview(null);
                        setFileName('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`relative p-4 rounded-full border transition-all duration-300 ${
                    isDragging
                      ? 'scale-125 rotate-3 bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/50 ring-8 ring-blue-400/20'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900'
                  }`}>
                    <Upload className={`w-7 h-7 transition-transform duration-300 ${isDragging ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="relative z-10 space-y-1">
                    <p className={`text-sm font-extrabold transition-colors ${
                      isDragging ? 'text-blue-700 dark:text-blue-300 scale-105' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {isDragging ? 'Release file to start instant forensic scan!' : fileName ? `Loaded: ${fileName}` : `Drag & drop or click to upload ${mediaType} file`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supports JPG, PNG, WEBP, WAV, MP3, MP4, MOV up to 50MB
                    </p>
                  </div>
                </>
              )}

            </div>
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
                setSelectedFile(null);
                setBase64Preview(null);
                setFileName('');
                setClaims('');
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{progressStage || 'Running Deepfake Scan...'}</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Run Deepfake Forensic Audit</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Neural AI Brain Network Modal while loading */}
      <NeuralScannerModal isOpen={loading} type="media" />

      {/* Skeleton Shimmer Loading State */}
      {loading && <CardSkeleton />}

      {/* Forensic Scan Results View - Color Coded Glassmorphism */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Success Celebration Header with Self-drawing Checkmark & Score Counter */}
          <SuccessCelebration
            score={result.deepfakeProbability}
            rating={result.verdict.replace(/_/g, ' ')}
            isCredible={result.deepfakeProbability < 40}
            title={result.title}
            isDeepfakeScore={true}
          />

          <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
            
            {/* Header Verdict Card & Animated Trust Score Gauge */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${getVerdictCardStyle(result.verdict)}`}>

            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-white/80 dark:bg-slate-900/80 border border-current shadow-xs">
                  {result.verdict.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-bold opacity-80">
                  Confidence: {result.confidence}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {result.title}
              </h2>
              {result.primaryModelDetected && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold">
                  <FileCode className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Fingerprint Engine: <strong>{result.primaryModelDetected}</strong></span>
                </div>
              )}
              <p className="text-xs leading-relaxed opacity-90 pt-1">
                {result.executiveSummary}
              </p>
            </div>

            {/* Animated Trust Gauge */}
            <div className="shrink-0">
              <TrustGauge
                score={result.deepfakeProbability}
                type="deepfake"
                size="lg"
                label="Synthetic Risk"
              />
            </div>
          </div>

          {/* Gemini AI Voice Narration & Plain-English Explanation Card */}
          <AIVoiceNarrationCard result={result} autoPlay={true} />

          {/* Dedicated Section Explaining Why This Media (Image/Audio/Video) Is Fake or Real */}
          {result.deepfakeProbability >= 40 || result.verdict !== 'AUTHENTIC' ? (
            /* FAKE / SYNTHETIC MEDIA REASONS */
            <div className="p-6 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-slate-900 dark:text-slate-100 space-y-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-rose-500/20 pb-3">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight flex items-center gap-2">
                    Why This {result.mediaType.toUpperCase()} Is Fake & AI-Generated
                  </h3>
                  <p className="text-xs text-rose-700/90 dark:text-rose-300 font-medium">
                    Forensic AI analysis evidence and synthetic manipulation breakdown
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-rose-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    Forensic AI Verdict & Key Reasons
                  </span>
                  <p className="text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                    {result.executiveSummary}
                  </p>
                </div>

                {result.primaryModelDetected && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Identified Generative AI Engine Signature: <strong>{result.primaryModelDetected}</strong></span>
                  </div>
                )}

                {/* Specific Artifact Reasons */}
                {result.artifacts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Specific Fake Features & Synthetic Artifacts Detected:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.artifacts.map((art, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              {art.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              {art.confidenceScore}% match
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                            {art.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Anomalies Log */}
                {result.forensicBreakdown.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Technical Signal Breakdown:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {result.forensicBreakdown.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* REAL / AUTHENTIC MEDIA REASONS */
            <div className="p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-slate-900 dark:text-slate-100 space-y-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight flex items-center gap-2">
                    Why This {result.mediaType.toUpperCase()} Is Real & Authentic
                  </h3>
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-300 font-medium">
                    Forensic AI evidence confirming physical sensor integrity and organic origin
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-emerald-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Authenticity Forensic Summary
                  </span>
                  <p className="text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                    {result.executiveSummary || `Detailed multimodal analysis confirms this ${result.mediaType} exhibits authentic physical capture characteristics without synthetic generative manipulation.`}
                  </p>
                </div>

                {/* Key Verification Reasons Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Confirmed Authentic Characteristics & Natural Signals:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Natural Sensor & Acoustic Noise
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                        {result.mediaType === 'image'
                          ? 'Consistent camera sensor noise distribution (PRNU pattern) without artificial diffusion smoothing.'
                          : result.mediaType === 'audio'
                          ? 'Continuous organic room reverberation and unbroken acoustic background resonance.'
                          : 'Organic sensor noise floor and natural optical focus falloff matching camera physics.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Coherent Physical Physics
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                        {result.mediaType === 'image'
                          ? 'Specular reflections and shadows match ambient light direction across 100% of the image.'
                          : result.mediaType === 'audio'
                          ? 'Physiological inhalation pauses and natural vocal formant pitch variations detected.'
                          : 'Natural eye blinking cadence, fluid jaw movement, and seamless lighting continuity.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Zero Generative Model Artifacts
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                        No AI vocoder spectral cutoffs, diffusion frequency grids, or neural face-swap boundary blurs.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Uncorrupted Metadata & Framing
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                        Standard compression curve, coherent edge frequency spectrum, and intact spatial pixel structure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Signals List */}
                {result.forensicBreakdown.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Authenticity Forensic Log:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {result.forensicBreakdown.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}



        </div>
      </div>
      )}

    </div>
  );
};

