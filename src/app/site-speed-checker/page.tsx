'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { TechnicalAudit } from '@/types/seo';
import { Zap, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SiteSpeedCheckerPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [technicalAudit, setTechnicalAudit] = useState<TechnicalAudit | null>(null);
  const [auditedUrl, setAuditedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid URL to analyze technical health.');
      return;
    }

    setIsLoading(true);
    setTechnicalAudit(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [trimmed] }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error running technical audit.');
      }

      const data = await res.json();
      const firstResult = data.results[0];

      if (firstResult && firstResult.status === 'success' && firstResult.technicalAudit) {
        setTechnicalAudit(firstResult.technicalAudit);
        setAuditedUrl(firstResult.url);
      } else {
        throw new Error(firstResult?.error || 'Failed to extract technical speed metrics from URL.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <title>Site Speed Checker | AnalyzeSERP</title>
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Audit Suite</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Lightweight Speed & Latency Auditor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Site Speed Checker
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Evaluate Time-to-First-Byte (TTFB) latency, raw HTML payload size, DOM node count depth, inline script overhead, and unoptimized asset warnings without heavy browser overhead.
          </p>
        </div>

        {/* Form Input Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
          <form onSubmit={handleAuditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Enter Website URL to Check Speed
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl glass-input text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Measuring TTFB & DOM Payload...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Site Speed & Latency</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Technical Health Result */}
        {technicalAudit && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              Speed & Latency Report for: <span className="text-amber-600 dark:text-amber-400">{auditedUrl}</span>
            </h3>
            <TechnicalHealthCard technicalAudit={technicalAudit} />
          </div>
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
