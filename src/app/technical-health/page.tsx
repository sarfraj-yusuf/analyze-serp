'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { TechnicalAudit } from '@/types/seo';
import { Zap, Sparkles, ArrowLeft, Search, Globe } from 'lucide-react';
import Link from 'next/link';

export default function TechnicalHealthPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [technicalAudit, setTechnicalAudit] = useState<TechnicalAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuditUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [urlInput.trim()] }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch technical health audit data');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setTechnicalAudit(data.results[0].technicalAudit);
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to inspect technical health');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing technical health audit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">Technical Health Audit</span>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Browser Latency Auditor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Lightweight Performance & <span className="gradient-text">Technical Health Audit</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Evaluate TTFB latency, HTML payload sizes (kB), DOM element counts, max tree depth, and inline script overhead without heavy headless browsers.
          </p>
        </div>

        {/* Search URL Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 max-w-3xl mx-auto space-y-4">
          <form onSubmit={handleAuditUrl} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                placeholder="Enter URL to audit technical health (e.g. https://ahrefs.com/blog/on-page-seo/)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Auditing Speed...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Audit Speed</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        </div>

        {/* Results Card */}
        {technicalAudit && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Audit Results</h3>
            <TechnicalHealthCard technicalAudit={technicalAudit} />
          </div>
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
