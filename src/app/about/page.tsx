'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { Zap, ShieldCheck, Cpu, Layers, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About AnalyzeSERP.com</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Fast, Non-AI <span className="gradient-text">Competitor SERP Intelligence</span>
          </h1>

          <p className="text-base text-slate-600 dark:text-gray-400 leading-relaxed">
            <strong>AnalyzeSERP</strong> was created to give content writers, SEO agencies, and digital marketers an instant, zero-AI latency engine for competitor analysis.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Zero AI Latency</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Unlike AI tools that hallucinate data and take 30+ seconds to respond, AnalyzeSERP parses live DOM structures in milliseconds using Cheerio.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keyword Gap Detection</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Cross-compare 2 to 5 competitor pages simultaneously to reveal Common Core Keywords and high-value Keyword Gaps missed by top rankings.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">White-Label Client PDFs</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Export 3-page, colorful executive PDF reports complete with your agency logo, custom accent colors, health scorecards, and action checklists.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why AnalyzeSERP?</h2>
          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
            In modern search engine optimization, outranking top competitors requires precision data: knowing exact word counts, heading structures, Flesch-Kincaid reading grade levels, and competitor affiliate monetization models.
          </p>
          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
            AnalyzeSERP provides an all-in-one suite that combines on-page auditing, live SERP snippet testing, readability analysis, and deep link inspection under one high-speed platform.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all"
            >
              <span>Try AnalyzeSERP Free Audit Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
