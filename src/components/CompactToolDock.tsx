'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Layers,
  ShieldCheck,
  Gauge,
  GitFork,
  Palette,
  Link2,
  FileCheck,
  Eye,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface ToolDockItem {
  id: string;
  name: string;
  href: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

export const ALL_TOOLS: ToolDockItem[] = [
  {
    id: 'home',
    name: 'Competitor SERP Audit',
    href: '/',
    badge: 'Flagship Benchmark',
    icon: Layers,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'technical-health',
    name: 'Technical Health',
    href: '/technical-health',
    badge: 'DOM / SSL',
    icon: ShieldCheck,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'site-speed-checker',
    name: 'Site Speed & TTFB',
    href: '/site-speed-checker',
    badge: 'TTFB & CWV',
    icon: Gauge,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'redirect-checker',
    name: 'Redirect Tracer',
    href: '/redirect-checker',
    badge: '301/302 Chains',
    icon: GitFork,
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'contrast-checker',
    name: 'Contrast Studio',
    href: '/contrast-checker',
    badge: 'WCAG 2.2',
    icon: Palette,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'affiliate-link-checker',
    name: 'Affiliate Links',
    href: '/affiliate-link-checker',
    badge: 'rel Tagging',
    icon: Link2,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'readability',
    name: 'Readability & Tone',
    href: '/readability',
    badge: 'Flesch Scale',
    icon: FileCheck,
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-500/10 border-teal-500/20',
  },
  {
    id: 'serp-snippet-preview',
    name: 'SERP Simulator',
    href: '/serp-snippet-preview',
    badge: '600px Bounds',
    icon: Eye,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'pdf-reports',
    name: 'White-Label PDF',
    href: '/pdf-reports',
    badge: 'Client Ready',
    icon: Sparkles,
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgClass: 'bg-pink-500/10 border-pink-500/20',
  },
];

interface CompactToolDockProps {
  currentTool: string;
  className?: string;
}

export function CompactToolDock({ currentTool, className = '' }: CompactToolDockProps) {
  // Filter out the current tool so the page never links to itself
  const visibleTools = ALL_TOOLS.filter((t) => t.id !== currentTool);

  return (
    <section
      aria-label="Related Diagnostic Tools"
      className={`p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Complementary Diagnostic Engines
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden md:inline">
            &bull; Run zero-latency isolated audits across the AnalyzeSERP utility suite
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>8 Active Micro-Audits</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {visibleTools.map((tool) => {
          const isHome = tool.id === 'home';
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all group shadow-2xs hover:shadow-xs border ${
                isHome
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30'
                  : 'bg-slate-50/90 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/[0.06] text-slate-700 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-white dark:hover:bg-white/[0.06]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md ${tool.bgClass} flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform`}
              >
                <tool.icon className={`w-3 h-3 ${tool.colorClass}`} />
              </div>
              <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.name}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold transition-colors ${
                  isHome
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                }`}
              >
                {tool.badge}
              </span>
              {isHome && (
                <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
