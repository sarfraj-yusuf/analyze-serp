'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhiteLabelPdfModal } from '@/components/WhiteLabelPdfModal';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
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

  const steps = [
    {
      title: 'Submit Target Webpage URL',
      description: 'Enter your agency client website or target URL to generate instant audit metrics.',
    },
    {
      title: 'Customize Agency Branding & Logo',
      description: 'Upload your agency logo, enter company name, and add custom executive recommendations.',
    },
    {
      title: 'Export Multi-Page Branded PDF Report',
      description: 'Download a client-ready vector PDF report complete with overall health score, technical audit, and keyword tables.',
    },
  ];

  const faqs = [
    {
      question: 'What is a White-Label SEO Report?',
      answer: 'A White-Label SEO Report allows agencies, freelancers, and consultants to generate comprehensive SEO audits featuring their own branding, agency logo, and custom notes without third-party vendor logos.',
    },
    {
      question: 'What metrics are included in the PDF export?',
      answer: 'PDF reports include overall health score, title & meta tag analysis, heading structure tree, word count, Flesch readability grade, 1-gram to 3-gram keyword density tables, and technical performance checks.',
    },
    {
      question: 'Are PDF reports free to export?',
      answer: 'Yes. AnalyzeSERP provides free PDF report exports for standard audits.',
    },
  ];

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
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
            <span>Agency Executive Reporting</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            White Label SEO <span className="gradient-text">Report Generator</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Generate clean, multi-page vector PDF SEO audit reports. Add custom agency branding, company logo, and executive recommendations for client proposals.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleFetchAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter client URL (e.g. https://example.com/on-page-seo/)"
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

        <SEOContentSection
          toolName="White Label SEO Report Generator"
          title="Deliver Professional Branded Client Audit Reports"
          description="Impress clients and close agency deals with vector-grade PDF SEO audits exported in seconds."
          steps={steps}
          importanceTitle="Why Professional PDF SEO Reports Drive Agency Revenue"
          importanceContent={`For agencies, freelancers, and SEO consultants, client communication is everything. Clear visual audit reports build immediate credibility during sales calls and monthly client check-ins.

PDF Report Highlights:
1. Custom Agency Branding: Upload your logo and custom headers.
2. Executive Summary & Scores: Unified 0–100 health score combining content quality and technical performance.
3. Actionable Technical Checklists: Clear pass/fail breakdowns for title tags, canonicals, HTTPS, and N-gram densities.`}
          faqs={faqs}
        />
      </main>

      <Footer />

      {auditResult && (
        <WhiteLabelPdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} audit={auditResult} />
      )}

      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
