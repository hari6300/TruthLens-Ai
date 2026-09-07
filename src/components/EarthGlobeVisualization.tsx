import React, { useEffect, useRef, useState } from 'react';

interface CountrySpot {
  name: string;
  lat: number;
  lng: number;
  claimsCount: number;
  risk: 'High' | 'Medium' | 'Low';
  flag: string;
}

export const EarthGlobeVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountrySpot | null>(null);

  const countries: CountrySpot[] = [
    { name: 'United States', lat: 38, lng: -97, claimsCount: 412, risk: 'High', flag: '🇺🇸' },
    { name: 'United Kingdom', lat: 55, lng: -3, claimsCount: 184, risk: 'Medium', flag: '🇬🇧' },
    { name: 'India', lat: 20, lng: 78, claimsCount: 520, risk: 'High', flag: '🇮🇳' },
    { name: 'Germany', lat: 51, lng: 10, claimsCount: 120, risk: 'Low', flag: '🇩🇪' },
    { name: 'Brazil', lat: -14, lng: -51, claimsCount: 290, risk: 'High', flag: '🇧🇷' },
    { name: 'Japan', lat: 36, lng: 138, claimsCount: 95, risk: 'Low', flag: '🇯🇵' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    let rotationAngle = 0;
    let animId: number;

    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotationAngle += 0.008;

      // Draw Globe Sphere Outer Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.8,
        centerX,
        centerY,
        radius * 1.25
      );
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Globe Base Sphere Gradient
      const globeGrad = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      globeGrad.addColorStop(0, '#1e293b');
      globeGrad.addColorStop(0.7, '#0f172a');
      globeGrad.addColorStop(1, '#020617');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Latitude and Longitude Grids
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;

      // Latitudes
      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const y = centerY - radius * Math.sin(rad);
        const rx = radius * Math.cos(rad);

        ctx.beginPath();
        ctx.ellipse(centerX, y, rx, rx * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitudes (Rotating)
      for (let lng = 0; lng < 360; lng += 45) {
        const rad = ((lng + rotationAngle * 50) * Math.PI) / 180;
        const rx = radius * Math.cos(rad);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.abs(rx), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Plot Country Hotspots on 3D Globe Projection
      countries.forEach((c) => {
        const lngRad = ((c.lng + rotationAngle * 50) * Math.PI) / 180;
        const latRad = (c.lat * Math.PI) / 180;

        // 3D sphere coordinate conversion
        const x = centerX + radius * Math.cos(latRad) * Math.sin(lngRad);
        const y = centerY - radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.cos(lngRad);

        // Only draw points on the visible front hemisphere (z > 0)
        if (z > 0) {
          const pulseScale = 1 + Math.sin(rotationAngle * 5 + c.lat) * 0.3;
          const color = c.risk === 'High' ? '#f43f5e' : c.risk === 'Medium' ? '#f59e0b' : '#10b981';

          // Outer pulse ring
          ctx.beginPath();
          ctx.arc(x, y, 9 * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = `${color}33`;
          ctx.fill();

          // Inner solid core
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Globe Canvas Container */}
      <div className="relative w-full md:w-1/2 h-64 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-blue-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>Global Disinformation Radar</span>
        </div>
      </div>

      {/* Country Intel List */}
      <div className="w-full md:w-1/2 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Verified Hotspots
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Live Syndication</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {countries.map((c) => (
            <div
              key={c.name}
              onClick={() => setSelectedCountry(c)}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover-popup-sm ${
                selectedCountry?.name === c.name
                  ? 'bg-blue-950/80 border-blue-500 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </div>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    c.risk === 'High'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : c.risk === 'Medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {c.risk}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {c.claimsCount} claims indexed
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
