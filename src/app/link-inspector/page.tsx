'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LinkInspectorCard } from '@/components/LinkInspectorCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { LinkAudit } from '@/types/seo';
import { Link2, Sparkles, ArrowLeft, Search, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function LinkInspectorPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkAudit, setLinkAudit] = useState<LinkAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInspectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrlInput(targetUrl);
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [targetUrl] }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch link footprint data');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setLinkAudit(data.results[0].linkAudit);
        triggerToolExecutionFeedback();
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to inspect link footprint');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while inspecting links.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audit Suite</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">Link & Citation Inspector</span>
        </nav>

        {/* Compact App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Link2 className="w-3 h-3" />
            <span>Citation & Anchor Scanner</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Deep Link & Citation Footprint Inspector
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Classify anchor text distribution (keyword-rich, branded, generic), audit internal vs outbound link ratios, and inspect competitor link equity in real time.
          </p>
        </header>

        {/* Top-Fold Tool Input Dock */}
        <section aria-label="Link Footprint Audit Form" className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel hero-input-dock rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <form onSubmit={handleInspectUrl} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="example.com or https://example.com/blog"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span>Inspecting...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Inspect Links</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Transient client fetch</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">Analyzes internal &amp; external href targets</span>
            </div>

            {error && <div className="text-xs text-red-600 dark:text-red-400 text-center font-semibold pt-1">{error}</div>}
          </div>

          {/* Results Card */}
          {linkAudit && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Link Footprint Scorecard</h3>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{urlInput}</span>
              </div>
              <LinkInspectorCard linkAudit={linkAudit} />
            </div>
          )}
        </section>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
