'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Sparkles, Search, Share2, Link2 } from 'lucide-react';

interface ToolCTAWidgetProps {
  toolType?: 'competitor' | 'serp' | 'link' | 'speed';
}

export const ToolCTAWidget: React.FC<ToolCTAWidgetProps> = ({ toolType = 'competitor' }) => {
  const configs = {
    competitor: {
      title: 'Run Free Competitor Keyword Gap Audit',
      desc: 'Compare up to 5 URLs side-by-side. Extract missing 1-gram, 2-gram, and 3-gram terms instantly.',
      href: '/',
      btnText: 'Try Competitor Auditor Free',
      icon: Search,
    },
    serp: {
      title: 'Test Your Title Tag & SERP Pixel Width',
      desc: 'Preview desktop and mobile Google snippet truncations before publishing.',
      href: '/serp-snippet-preview',
      btnText: 'Try SERP Preview Tool',
      icon: Sparkles,
    },
    link: {
      title: 'Inspect Outbound Links for rel="sponsored"',
      desc: 'Detect affiliate link parameters and verify Google link spam compliance.',
      href: '/affiliate-link-checker',
      btnText: 'Check Links Free',
      icon: Link2,
    },
    speed: {
      title: 'Audit Time to First Byte (TTFB) Speed',
      desc: 'Measure server response latency, DOM depth, and Core Web Vitals signals.',
      href: '/site-speed-checker',
      btnText: 'Check Speed Free',
      icon: Zap,
    },
  };

  const config = configs[toolType] || configs.competitor;
  const Icon = config.icon;

  return (
    <div className="my-8 p-6 rounded-2xl glass-panel border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 shadow-lg space-y-4 not-prose">
      <div className="flex items-center gap-2">
        <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Free AnalyzeSERP Tool
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-500" />
            <span>{config.title}</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed max-w-xl">
            {config.desc}
          </p>
        </div>

        <Link
          href={config.href}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
        >
          <span>{config.btnText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
