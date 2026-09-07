import React, { useEffect, useState } from 'react';

interface OCRScannerOverlayProps {
  isScanning: boolean;
  imageSrc?: string;
  fileName?: string;
  ocrTextList?: string[];
  onComplete?: () => void;
}

export const OCRScannerOverlay: React.FC<OCRScannerOverlayProps> = ({
  isScanning,
  imageSrc,
  fileName = 'Uploaded Image',
  ocrTextList = [
    'OCR DETECTED: "Urgent breaking announcement from government sources..."',
    'OCR CONFIDENCE: 98.4%',
    'TYPOGRAPHIC ANOMALIES: 3 artifacts detected',
    'FONT CONSISTENCY: Synthetic overlay detected',
  ],
}) => {
  const [visibleTextCount, setVisibleTextCount] = useState<number>(0);

  useEffect(() => {
    if (!isScanning) {
      setVisibleTextCount(0);
      return;
    }

    const interval = setInterval(() => {
      setVisibleTextCount((prev) => {
        if (prev < ocrTextList.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isScanning, ocrTextList.length]);

  if (!isScanning) return null;

  return (
    <div className="w-full flex flex-col md:flex-row items-center md:items-stretch gap-5 p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-md shadow-2xl z-20">
      
      {/* LEFT: Clean Image Box with Laser Beam Scan Overlay */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden min-h-[220px] w-full">
        
        {/* Animated Laser Scan Line across Image */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-ocr-scan z-10 pointer-events-none" />

        {/* HUD Target Crosshairs */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 z-10 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 z-10 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 z-10 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 z-10 pointer-events-none" />

        {/* The Clean Image Preview */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Scanned content"
            className="max-h-56 w-auto object-contain rounded-lg shadow-lg border border-slate-700/80"
          />
        ) : (
          <div className="h-44 w-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs font-mono">
            [IMAGE MATRIX ACTIVE]
          </div>
        )}

        <div className="mt-2 text-center z-10">
          <p className="text-[11px] font-mono font-bold text-cyan-400 truncate max-w-[220px]">
            {fileName}
          </p>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Optical Forensic Scan
          </span>
        </div>
      </div>

      {/* RIGHT: Extracted Content & OCR Analysis Box */}
      <div className="flex-1 w-full flex flex-col justify-between p-4 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-left space-y-3 shadow-inner">
        
        {/* Header HUD Status Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/60 text-cyan-300 font-bold text-[10px]">
            [OCR REGION 01: 99.2%]
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/60 text-emerald-300 font-bold text-[10px]">
            [METADATA MATRIX VERIFIED]
          </span>
        </div>

        {/* Content Box displaying extracted text and findings */}
        <div className="space-y-2 flex-1 min-h-[140px]">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">
            Extracted Image Content & Box Data:
          </span>

          {ocrTextList.slice(0, visibleTextCount).map((text, idx) => (
            <div
              key={idx}
              className="text-xs font-mono text-cyan-200 bg-slate-900/90 border border-cyan-500/30 p-2.5 rounded-lg shadow-sm animate-fadeIn flex items-start gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mt-1 shrink-0" />
              <span className="leading-snug break-words">{text}</span>
            </div>
          ))}
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            OCR SCANNING ACTIVE
          </span>
          <span>4 Anomalies Detected</span>
        </div>
      </div>

    </div>
  );
};

