import React, { useState, useRef } from 'react';

interface VisionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'rose' | 'amber' | 'emerald';
  tiltScale?: number;
}

export const VisionCard: React.FC<VisionCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  tiltScale = 1.03,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt calculations (-5deg to +5deg)
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    // Percentages for glass glare reflection
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${tiltScale}, ${tiltScale}, 1) translateY(-4px)`
    );
    setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0px)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const glowShadowMap = {
    blue: 'hover:shadow-blue-500/20 dark:hover:shadow-blue-500/25 hover:border-blue-300 dark:hover:border-blue-700/80',
    purple: 'hover:shadow-purple-500/20 dark:hover:shadow-purple-500/25 hover:border-purple-300 dark:hover:border-purple-700/80',
    rose: 'hover:shadow-rose-500/20 dark:hover:shadow-rose-500/25 hover:border-rose-300 dark:hover:border-rose-700/80',
    amber: 'hover:shadow-amber-500/20 dark:hover:shadow-amber-500/25 hover:border-amber-300 dark:hover:border-amber-700/80',
    emerald: 'hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/25 hover:border-emerald-300 dark:hover:border-emerald-700/80',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.3s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative overflow-hidden transition-all duration-300 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl ${glowShadowMap[glowColor]} ${className}`}
      {...props}
    >
      {/* Glass Reflection / Apple VisionOS Specular Sheen Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
};
