'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { TechnicalAudit } from '@/types/seo';
import { Zap, Sparkles, ArrowLeft, Search, Globe } from 'lucide-react';
import Link from 'next/link';

export default function TechnicalHealthPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [technicalAudit, setTechnicalAudit] = useState<TechnicalAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      title: 'Enter Target URL for Audit',
      description: 'Submit any webpage URL to run server-side DOM scraping and technical header validation.',
    },
    {
      title: 'Scan Security & Indexability Directives',
      description: 'Audit HTTPS encryption, canonical tag declarations, robots meta directives, and viewport tags.',
    },
    {
      title: 'Get 0–100 Technical Health Score',
      description: 'Receive an instant score with actionable recommendations to fix crawlability and indexing issues.',
    },
  ];

  const faqs = [
    {
      question: 'What is a Technical SEO Audit?',
      answer: 'A Technical SEO Audit evaluates website infrastructure elements (HTTPS, canonical tags, meta robots directives, viewport responsiveness, and JSON-LD schema) to ensure search engine crawlers can index your pages efficiently.',
    },
    {
      question: 'Why are Canonical Tags important for SEO?',
      answer: 'Canonical tags tell search engines which URL version is the master copy of a page, preventing duplicate content issues and consolidating PageRank authority.',
    },
    {
      question: 'What happens if a page has a "noindex" robots directive?',
      answer: 'If a meta robots tag contains "noindex", search engines like Google will completely exclude the page from search results.',
    },
  ];

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
          <span className="text-slate-900 dark:text-white font-bold">Technical Health Audit</span>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Technical SEO Infrastructure Scanner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Technical SEO <span className="gradient-text">Audit & Health Checker</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Scan website technical infrastructure: HTTPS encryption, canonical tag declarations, robots directives, viewport configuration, and JSON-LD structured data.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleAuditUrl} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://example.com"
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
                <span>Auditing Health...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Run Health Audit</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        </div>

        {/* Audit Results */}
        {technicalAudit && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Audit Results</h3>
            <TechnicalHealthCard technicalAudit={technicalAudit} />
          </div>
        )}

        <SEOContentSection
          toolName="Technical SEO Audit Tool"
          title="Ensure Search Engine Crawlers Can Index Your Content"
          description="Technical SEO issues like missing canonicals or broken robots directives can completely block your pages from search indexation."
          steps={steps}
          importanceTitle="Why Technical SEO Audits Are Essential"
          importanceContent={`Even world-class content will not rank if technical barriers prevent search bots from properly crawling and indexing your site.

Essential Technical Health Checkpoints:
1. HTTPS Security: Secure SSL/TLS protocol protection is mandatory for web safety and search ranking.
2. Canonical Alignment: Avoid self-canonical mismatches that lead to duplicate content indexing.
3. Mobile Viewport: Ensure responsive mobile meta viewport tags exist for Mobile-First indexing.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
