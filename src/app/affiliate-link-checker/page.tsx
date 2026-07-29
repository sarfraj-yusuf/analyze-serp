'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LinkInspectorCard } from '@/components/LinkInspectorCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { LinkAudit } from '@/types/seo';
import { Link2, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AffiliateLinkCheckerPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkAudit, setLinkAudit] = useState<LinkAudit | null>(null);
  const [auditedUrl, setAuditedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid URL to inspect links and affiliate footprints.');
      return;
    }

    setIsLoading(true);
    setLinkAudit(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [trimmed] }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error inspecting links.');
      }

      const data = await res.json();
      const firstResult = data.results[0];

      if (firstResult && firstResult.status === 'success' && firstResult.linkAudit) {
        setLinkAudit(firstResult.linkAudit);
        setAuditedUrl(firstResult.url);
      } else {
        throw new Error(firstResult?.error || 'Failed to extract link audit footprint.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <title>Affiliate Link Checker | AnalyzeSERP</title>
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            <Link2 className="w-3.5 h-3.5" />
            <span>Affiliate Network & Anchor Text Footprint Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Affiliate Link Checker
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Audit competitor external outbound links, detect affiliate network parameters (Amazon Associates, ShareASale, Impact, CJ, Rakuten), and classify anchor texts into Keyword-Rich, Branded, or Generic categories.
          </p>
        </div>

        {/* Form Input Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
          <form onSubmit={handleAuditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Enter Competitor URL to Inspect Links
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="https://example.com/best-laptop-reviews"
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Link2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Outbound & Affiliate Links...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Inspect Links & Affiliate Footprint</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link Audit Result */}
        {linkAudit && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              Link Footprint Report for: <span className="text-cyan-600 dark:text-cyan-400">{auditedUrl}</span>
            </h3>
            <LinkInspectorCard linkAudit={linkAudit} />
          </div>
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
