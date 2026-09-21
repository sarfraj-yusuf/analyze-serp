'use client';

import React, { useRef, useState } from 'react';

export type SpotlightVariant = 'emerald' | 'cyan' | 'purple' | 'amber' | 'blue';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Color preset variant for glowing border and torch illumination */
  variant?: SpotlightVariant;
  /** Optional custom border glow color string override */
  borderGlowColor?: string;
  /** Optional outer container class */
  className?: string;
  /** Inner content container class */
  innerClassName?: string;
}

const COLOR_MAP: Record<
  SpotlightVariant,
  {
    borderGlow: string;
    torchGlow: string;
  }
> = {
  emerald: {
    borderGlow: 'rgba(16, 185, 129, 0.9)',
    torchGlow: 'rgba(16, 185, 129, 0.11)',
  },
  cyan: {
    borderGlow: 'rgba(6, 182, 212, 0.9)',
    torchGlow: 'rgba(6, 182, 212, 0.11)',
  },
  purple: {
    borderGlow: 'rgba(168, 85, 247, 0.9)',
    torchGlow: 'rgba(168, 85, 247, 0.11)',
  },
  amber: {
    borderGlow: 'rgba(245, 158, 11, 0.9)',
    torchGlow: 'rgba(245, 158, 11, 0.11)',
  },
  blue: {
    borderGlow: 'rgba(59, 130, 246, 0.9)',
    torchGlow: 'rgba(59, 130, 246, 0.11)',
  },
};

export function SpotlightCard({
  children,
  variant = 'emerald',
  borderGlowColor,
  className = '',
  innerClassName = 'p-5 sm:p-6 flex flex-col justify-between flex-1',
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const colors = COLOR_MAP[variant] || COLOR_MAP.emerald;
  const activeBorderGlow = borderGlowColor || colors.borderGlow;

  const updateCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spotlight-x', `${x}px`);
    cardRef.current.style.setProperty('--spotlight-y', `${y}px`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e);
    if (!isHovered) setIsHovered(true);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl p-[1px] h-full flex flex-col transition-colors duration-200 ${className}`}
      {...props}
    >
      {/* 1. Base Static Border */}
      <div className="absolute inset-0 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] pointer-events-none transition-colors duration-300 group-hover:border-slate-300 dark:group-hover:border-white/20" />

      {/* 2. Focused Magnetic Border Glow (Tight 200px radius rim) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-0 !m-0"
        style={{
          margin: 0,
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(200px circle at var(--spotlight-x, 0px) var(--spotlight-y, 0px), ${activeBorderGlow}, transparent 60%)`,
        }}
      />

      {/* 3. Inner Card Surface */}
      <div className="relative z-10 w-full h-full flex-1 rounded-[15px] bg-white dark:bg-slate-900/90 backdrop-blur-xl transition-colors duration-300 overflow-hidden flex flex-col">
        {/* 4. Focused Tight Torch (Zero margin, completely isolated from content flow) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[15px] transition-opacity duration-300 z-0 !m-0"
          style={{
            margin: 0,
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(220px circle at var(--spotlight-x, 0px) var(--spotlight-y, 0px), ${colors.torchGlow}, transparent 65%)`,
          }}
        />

        {/* 5. Real Content Container */}
        <div
          className={`relative z-10 w-full h-full flex-1 flex flex-col justify-between ${innerClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
