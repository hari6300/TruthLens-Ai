import React from 'react';
import {
  BookOpen,
  Eye,
  Mic,
  Video,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Layers,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export const FactCheckGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header Banner - Glassmorphism */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-400">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Forensic Deepfake & Disinformation Educational Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          How AI Deepfake & Credibility Detection Works
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Learn the technical forensic signatures used by machine learning models to identify voice clones, manipulated video lipsyncs, generative diffusion images, and viral fake news framing.
        </p>
      </div>

      {/* Guide Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Voice Clone & Audio Forensics */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 hover-popup">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Mic className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Neural Voice Clone Detection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Acoustic & spectral vocal analysis</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300">1. High-Frequency Spectral Cutoffs</span>
              <p className="text-slate-600 dark:text-slate-400">
                Neural vocoders (e.g. ElevenLabs, VALL-E) frequently compress output audio, causing frequencies above 11kHz - 16kHz to drop off abruptly on spectrogram plots.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300">2. Absence of Physiological Respiration</span>
              <p className="text-slate-600 dark:text-slate-400">
                Synthetic speech often articulates long phrases without natural micro-pauses for inhalation or acoustic room reverberation reflections.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300">3. Pitch Quantization & Monotone Glitches</span>
              <p className="text-slate-600 dark:text-slate-400">
                When generating emotional inflection, voice cloning models occasionally exhibit unnatural zero-crossing pitch jitter or metallic robotization.
              </p>
            </div>
          </div>
        </div>

        {/* Module 2: AI Generative Image Artifacts */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 hover-popup">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Generative AI Image Forensics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Diffusion & GAN visual signatures</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-blue-800 dark:text-blue-300">1. Specular Reflection Incoherence</span>
              <p className="text-slate-600 dark:text-slate-400">
                Light catchlights in human eyes or reflections on glossy surfaces frequently point toward contradictory light sources in AI-generated photos.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-blue-800 dark:text-blue-300">2. Text Hallucination & Pseudo-Language</span>
              <p className="text-slate-600 dark:text-slate-400">
                Background signage, logos, and newspaper headlines in synthetic images display non-alphabetic, warped glyphs due to latent token decoding.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-blue-800 dark:text-blue-300">3. Anatomical & Edge Blurring</span>
              <p className="text-slate-600 dark:text-slate-400">
                Generative diffusion models struggle with fine structural topology such as finger count, earring symmetry, and background fence geometries.
              </p>
            </div>
          </div>
        </div>

        {/* Module 3: Deepfake Video & Lipsync AI */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <Video className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Deepfake Video & Lipsync Analysis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temporal & boundary manipulation</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-300">1. Eye Blinking Frequency Anomalies</span>
              <p className="text-slate-600 dark:text-slate-400">
                Human adults blink between 12 to 20 times per minute. Deepfake video face swaps frequently display abnormally rapid or total absence of eye blinking.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-300">2. Boundary Distortion & Haloing</span>
              <p className="text-slate-600 dark:text-slate-400">
                During fast head movement, facial boundary masks produce pixel flickering, color bleeding around chin jawlines, and ear alignment drift.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-300">3. Phoneme-to-Viseme Desynchronization</span>
              <p className="text-slate-600 dark:text-slate-400">
                Neural lipsync overlays introduce slight 20ms - 80ms audio-visual latency, causing mouth movements to lag behind plosive consonant sounds (P, B, M).
              </p>
            </div>
          </div>
        </div>

        {/* Module 4: Fake News & Disinformation Framing */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Social Media Disinformation Tactics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Psychological & clickbait indicators</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">1. Artificial Urgency Pressures</span>
              <p className="text-slate-600 dark:text-slate-400">
                Viral posts designed to bypass critical thinking rely on commands like "Retweet before deleted!", "Mainstream media is hiding this!", or "Emergency Decree!".
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">2. Absence of Secondary Press Wire Confirmation</span>
              <p className="text-slate-600 dark:text-slate-400">
                Major breaking events always trigger coverage across multiple independent global wire services (AP, Reuters, AFP). Single-source viral claims are high risk.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">3. Deceptive Account Attribution</span>
              <p className="text-slate-600 dark:text-slate-400">
                Spoofed news handles alter single letters in official press usernames (e.g., @BBCWorldNews_x) to masquerade as verified journalistic channels.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
