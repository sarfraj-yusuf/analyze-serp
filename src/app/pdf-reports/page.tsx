'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { WhiteLabelPdfModal } from '@/components/WhiteLabelPdfModal';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SinglePageAudit } from '@/types/seo';
import { FileText, Sparkles, ArrowLeft, Search, Globe, Download } from 'lucide-react';
import Link from 'next/link';

export default function PdfReportsPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<SinglePageAudit | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchAudit = async (e: React.FormEvent) => {
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
        throw new Error('Failed to fetch audit data for PDF report');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setAuditResult(data.results[0]);
        setIsPdfModalOpen(true);
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to analyze page for PDF generation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while preparing PDF report.');
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
          <span className="text-slate-900 dark:text-white font-bold">White-Label PDF Reports</span>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>B2B Agency Executive Reports</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            White-Label Executive <span className="gradient-text">PDF Report Generator</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Generate 3-page, colorful client-ready PDF reports with agency branding, custom logos, health scorecards (0–100), keyword density bar charts, and actionable optimization checklists.
          </p>
        </div>

        {/* Search URL Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 max-w-3xl mx-auto space-y-4">
          <form onSubmit={handleFetchAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                placeholder="Enter client URL to generate branded PDF report (e.g. https://ahrefs.com/blog/on-page-seo/)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Generating Audit...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate PDF Report</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        </div>

        {/* Re-open Modal Button if Audit Ready */}
        {auditResult && (
          <div className="text-center">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs inline-flex items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Customize & Export PDF Report for {new URL(auditResult.url).hostname}</span>
            </button>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-slate-200 dark:border-white/10 mt-16 py-6 text-center text-xs text-slate-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} SEO Matrix. Built with Next.js & Cheerio.</div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-gray-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Home</Link>
            <Link href="/pdf-reports" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">PDF Reports</Link>
            <Link href="/technical-health" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Technical Health</Link>
          </div>
        </div>
      </footer>

      {auditResult && (
        <WhiteLabelPdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} audit={auditResult} />
      )}

      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
