'use client';

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  animateOnHover?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className = '',
  animateOnHover = true,
}) => {
  // Dimensions mapping - Balanced & Compact
  const sizeMap = {
    sm: { icon: 32, text: 'text-lg', tagline: 'text-[8px]' },
    md: { icon: 40, text: 'text-2xl', tagline: 'text-[9px]' },
    lg: { icon: 48, text: 'text-2xl sm:text-3xl', tagline: 'text-[9.5px]' },
    xl: { icon: 68, text: 'text-4xl', tagline: 'text-xs' },
  };

  const { icon: iconDim, text: textSize, tagline: taglineSize } = sizeMap[size];

  // The 3D Isometric Crystal Pedestal Icon (SVG) - 1:1 Square ViewBox for Laser Centering
  const IconMark = (
    <svg
      viewBox="45 60 230 230"
      width={iconDim}
      height={iconDim}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${animateOnHover ? 'transition-transform duration-300 group-hover:scale-105' : ''}`}
      aria-label="AnalyzeSERP Logo Mark"
    >
      <defs>
        {/* Slab 1 (Base Midnight Slate) */}
        <linearGradient id="pS1L" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="pS1R" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="pS1T" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Slab 2 (Middle Slate Blue) */}
        <linearGradient id="pS2L" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A5F" />
          <stop offset="100%" stopColor="#0F2038" />
        </linearGradient>
        <linearGradient id="pS2R" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D5584" />
          <stop offset="100%" stopColor="#193354" />
        </linearGradient>
        <linearGradient id="pS2T" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#41729F" />
          <stop offset="100%" stopColor="#234974" />
        </linearGradient>

        {/* Slab 3 (Top Icy Cyan) */}
        <linearGradient id="pS3L" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B6E8C" />
          <stop offset="100%" stopColor="#244A62" />
        </linearGradient>
        <linearGradient id="pS3R" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B93B2" />
          <stop offset="100%" stopColor="#396884" />
        </linearGradient>
        <linearGradient id="pS3T" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BCE6E2" />
          <stop offset="50%" stopColor="#6FAFC1" />
          <stop offset="100%" stopColor="#467B97" />
        </linearGradient>

        {/* Crystal Facets (Luminous Gemstone) */}
        <linearGradient id="pCTopLeft" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="45%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="pCTopRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="pCBotLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="pCBotRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#022C22" />
        </linearGradient>

        {/* Crystal Ambient Pool Reflection */}
        <radialGradient id="pAuraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#10B981" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground Ambient Shadow */}
      <ellipse cx="160" cy="274" rx="95" ry="16" fill="#020617" opacity="0.35" />

      {/* Slab 1: Base Dark Slate */}
      <g id="p-slab-1">
        <polygon points="64,228 160,272 160,296 64,252" fill="url(#pS1L)" />
        <polygon points="160,272 256,228 256,252 160,296" fill="url(#pS1R)" />
        <polygon points="160,204 256,228 160,272 64,228" fill="url(#pS1T)" />
        <polyline points="64,228 160,272 256,228" stroke="#475569" strokeWidth="1.2" opacity="0.6" />
      </g>

      {/* Slab 2: Mid Slate Blue */}
      <g id="p-slab-2" transform="translate(0, -28)">
        <polygon points="64,228 160,272 160,296 64,252" fill="url(#pS2L)" />
        <polygon points="160,272 256,228 256,252 160,296" fill="url(#pS2R)" />
        <polygon points="160,204 256,228 160,272 64,228" fill="url(#pS2T)" />
        <polyline points="64,228 160,272 256,228" stroke="#60A5FA" strokeWidth="1.3" opacity="0.5" />
      </g>

      {/* Slab 3: Top Icy Cyan */}
      <g id="p-slab-3" transform="translate(0, -56)">
        <polygon points="64,228 160,272 160,296 64,252" fill="url(#pS3L)" />
        <polygon points="160,272 256,228 256,252 160,296" fill="url(#pS3R)" />
        <polygon points="160,204 256,228 160,272 64,228" fill="url(#pS3T)" />
        <ellipse cx="160" cy="238" rx="42" ry="18" fill="url(#pAuraGlow)" />
        <polyline points="64,228 160,272 256,228" stroke="#E2F1F8" strokeWidth="1.5" opacity="0.75" />
      </g>

      {/* The Emerald Apex Crystal (No antenna feelers, pure faceted gem) */}
      <g id="p-crystal">
        {/* Bottom facets */}
        <polygon points="114,136 160,154 160,172 114,136" fill="url(#pCBotLeft)" opacity="0.95" />
        <polygon points="160,154 206,136 160,172 160,154" fill="url(#pCBotRight)" opacity="0.95" />

        {/* Upper pyramid facets */}
        <polygon points="160,80 114,136 160,154" fill="url(#pCTopLeft)" />
        <polygon points="160,80 160,154 206,136" fill="url(#pCTopRight)" />

        {/* Crisp Specular Center Ridge */}
        <line x1="160" y1="80" x2="160" y2="154" stroke="#F0FDF4" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="160" y1="80" x2="114" y2="136" stroke="#A7F3D0" strokeWidth="1.2" opacity="0.7" />

        {/* Apex Sparkle / Gleam Star (Rank #1 Achievement) */}
        <path d="M160,72 L162,78 L168,80 L162,82 L160,88 L158,82 L152,80 L158,78 Z" fill="#FFFFFF" opacity="0.95" />
        <circle cx="160" cy="80" r="1.8" fill="#FFFFFF" />
      </g>
    </svg>
  );

  if (variant === 'icon' || variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {IconMark}
      </div>
    );
  }

  return (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {IconMark}

      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-tight leading-none flex items-center ${textSize}`}>
          {/* Analyze: Dark in light mode, crisp white in dark mode */}
          <span className="text-slate-900 dark:text-white transition-colors">
            Analyze
          </span>
          {/* SERP: High-voltage emerald green */}
          <span className="text-emerald-500 font-black tracking-tight">
            SERP
          </span>
        </div>

        {showTagline && (
          <p className={`font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 mt-1 uppercase leading-tight whitespace-nowrap ${taglineSize}`}>
            ANALYZE <span className="text-emerald-500 font-extrabold">•</span> COMPARE <span className="text-emerald-500 font-extrabold">•</span> RANK HIGHER
          </p>
        )}
      </div>
    </div>
  );
};
