'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RedirectChainVisualizer } from '@/components/RedirectChainVisualizer';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { RedirectChainReportData } from '@/lib/redirect-tracer';
import { Layers, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function RedirectChainCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<RedirectChainReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      title: 'Enter Starting URL',
      description: 'Enter any HTTP or HTTPS web address to trigger server-side step-by-step redirect tracing.',
    },
    {
      title: 'Trace HTTP Hops & Response Times',
      description: 'Recursively follow Location headers, measure latency per hop (ms), and flag 301 vs 302 status codes.',
    },
    {
      title: 'Audit Flowchart & Direct Shortcut Fixes',
      description: 'View the step-by-step node flowchart tree and apply 1-click recommendations to eliminate crawl latency.',
    },
  ];

  const faqs = [
    {
      question: 'What is a Redirect Chain and why does it hurt SEO?',
      answer: 'A redirect chain occurs when a URL redirects to another URL, which in turn redirects to another (e.g. A -> B -> C). Each hop adds latency, wastes Googlebot crawl budget, and degrades page speed scores.',
    },
    {
      question: 'What is the difference between 301 and 302 redirects for Google?',
      answer: 'A 301 Redirect indicates a permanent move and passes 100% of Link Equity (PageRank) to the destination. A 302 Redirect indicates a temporary move, which may cause Google not to index the new destination or delay ranking transfers.',
    },
    {
      question: 'How do Infinite Redirect Loops happen?',
      answer: 'Infinite loops occur when URL A redirects to URL B, and URL B redirects back to URL A. Browsers terminate this with an ERR_TOO_MANY_REDIRECTS error, causing complete page downtime.',
    },
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to trace HTTP redirect chain.');
      }

      const json = await res.json();
      setReport(json.report);
      triggerToolExecutionFeedback();
    } catch (err: any) {
      setError(err.message || 'Unable to trace target URL. Please verify the web address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>HTTP Redirect Chain & Infinite Loop Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            301/302 Redirect Chain <br />
            <span className="gradient-text">& Infinite Loop Inspector</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Trace multi-hop HTTP redirect chains, measure per-hop latency (ms), detect 302 temporary leaks, and eliminate ERR_TOO_MANY_REDIRECTS loops in seconds.
          </p>
        </div>

        {/* Input Audit Box */}
        <div className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-6">
            <form onSubmit={handleAudit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Enter Starting URL to Trace Redirects
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="http://example.com"
                    className="w-full pl-4 pr-4 py-3.5 sm:py-4 rounded-xl glass-input text-xs sm:text-sm focus:outline-none font-mono transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Tracing HTTP Headers & Location Hops...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Trace Redirect Chain & Measure Latency</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Audit Results & Flowchart Visualizer */}
        {report && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <RedirectChainVisualizer report={report} />
          </div>
        )}

        <SEOContentSection
          toolName="HTTP Redirect Chain Checker"
          title="Eliminate Unnecessary Redirect Hops & Protect Google Crawl Budget"
          description="Every redirect hop adds latency and wastes Googlebot crawl budget. Audit 301 vs 302 redirects to ensure maximum PageRank transfer."
          steps={steps}
          importanceTitle="Why Redirect Chains Destroy Page Speed & SEO Rankings"
          importanceContent={`Redirect chains harm websites in three major ways:
          
Key Technical Risks:
1. Increased Latency: Every redirect hop requires a new TCP handshake and HTTP response, adding 100ms - 500ms of delay to page loading.
2. Wasted Crawl Budget: Googlebot limits the number of redirects it follows per page crawl. Long chains result in unindexed target URLs.
3. 302 Temporary Leaks: 302 redirects do not pass full PageRank authority, leading to ranking drops.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
