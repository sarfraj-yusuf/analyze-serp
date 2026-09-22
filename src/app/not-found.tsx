'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  Compass,
  Home,
  Search,
  Gauge,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileSearch,
} from 'lucide-react';

const SUGGESTED_TOOLS = [
  {
    title: 'Competitor SEO Audit',
    description: 'Compare up to 5 URLs side-by-side with raw DOM metrics & keyword density.',
    href: '/#hero-audit-dock',
    icon: Search,
    badge: 'Core Engine',
  },
  {
    title: 'Technical Health Checker',
    description: 'Inspect canonicals, meta robots, OpenGraph, viewport, and schema markup.',
    href: '/technical-health',
    icon: ShieldCheck,
    badge: 'Popular',
  },
  {
    title: 'SERP Preview Simulator',
    description: 'Simulate exact Google desktop and mobile search snippets with pixel truncations.',
    href: '/serp-simulator',
    icon: EyeIcon,
    badge: 'Visual',
  },
  {
    title: 'Featured Snippet Optimizer',
    description: 'Reverse-engineer Position 0 formats (paragraphs, lists, tables).',
    href: '/featured-snippet-optimizer',
    icon: Sparkles,
    badge: 'Rank #0',
  },
  {
    title: 'Core Web Vitals & Speed',
    description: 'Analyze TTFB, resource weight, compression, and server latency benchmarks.',
    href: '/site-speed-checker',
    icon: Gauge,
    badge: 'Fast',
  },
  {
    title: 'SEO Guides & Changelog',
    description: 'In-depth search algorithms teardowns, competitive strategy, and updates.',
    href: '/blog',
    icon: BookOpen,
    badge: 'Articles',
  },
];

function EyeIcon({ className }: { className?: string }) {
  return <FileSearch className={className} />;
}

export default function NotFound() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
        {/* Central 404 Hero Section */}
        <div className="glass-panel border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Compass / Search Icon Badge */}
          <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Compass className="size-10 animate-spin-slow" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10">
              <span>Status 404</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">Page Not Found</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Lost in the SERPs?
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              The URL or tool endpoint you navigated to does not exist, has been relocated, or is no longer in our active search index.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Home className="size-4" />
              <span>Back to Homepage</span>
            </Link>

            <Link
              href="/#hero-audit-dock"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all border border-slate-200/80 dark:border-white/10 active:scale-95 cursor-pointer"
            >
              <Search className="size-4 text-emerald-500" />
              <span>Run Free Competitor Audit</span>
            </Link>
          </div>
        </div>

        {/* Directory of Active Tools */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
              <Layers className="size-4 text-emerald-500" />
              <span>Available SEO Tools Directory</span>
            </h2>
            <Link
              href="/#features"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all features</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUGGESTED_TOOLS.map((tool) => {
              const IconComp = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-emerald-500/10 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <IconComp className="size-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                        {tool.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform pt-1">
                    <span>Launch tool</span>
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
