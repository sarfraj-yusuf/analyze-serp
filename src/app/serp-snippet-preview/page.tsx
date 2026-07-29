'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SerpSocialSimulator } from '@/components/SerpSocialSimulator';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { MetaData } from '@/types/seo';
import { Share2, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SerpSnippetPreviewPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [auditedUrl, setAuditedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid URL to simulate SERP snippet and social preview.');
      return;
    }

    setIsLoading(true);
    setMeta(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [trimmed] }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error extracting metadata.');
      }

      const data = await res.json();
      const firstResult = data.results[0];

      if (firstResult && firstResult.status === 'success' && firstResult.meta) {
        setMeta(firstResult.meta);
        setAuditedUrl(firstResult.url);
      } else {
        throw new Error(firstResult?.error || 'Failed to extract metadata for SERP simulation.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <title>SERP Snippet Preview | AnalyzeSERP</title>
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <Share2 className="w-3.5 h-3.5" />
            <span>Google SERP & OpenGraph Social Card Previewer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            SERP Snippet Preview
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Preview how your page title, meta description, and OpenGraph social cards will render in Google Search desktop/mobile results, Twitter/X, and Facebook.
          </p>
        </div>

        {/* Form Input Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
          <form onSubmit={handleAuditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Enter Website URL to Preview SERP Snippet
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Share2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Metadata & Generating Preview...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Simulate SERP & Social Cards</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* SERP Simulator Result */}
        {meta ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              Live SERP Preview for: <span className="text-indigo-600 dark:text-indigo-400">{auditedUrl}</span>
            </h3>
            <SerpSocialSimulator meta={meta} targetUrl={auditedUrl} />
          </div>
        ) : (
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-4">
              Interactive Preview Studio (Enter Custom Metadata)
            </h3>
            <SerpSocialSimulator
              meta={{
                title: 'Competitor SEO Audit & SERP Analysis Tool 2026',
                titleLength: 47,
                titlePixelEstimate: 450,
                titleTruncated: false,
                description:
                  'Cross-compare competitor search results, extract keyword gap matrices, calculate readability grade levels, and generate white-label PDF reports.',
                descriptionLength: 155,
                descriptionTruncated: false,
                canonicalUrl: 'https://analyzeserp.com',
                robotsDirective: 'index, follow',
                ogTitle: 'Competitor SEO Audit & SERP Analysis Tool 2026',
                ogDescription: 'Cross-compare competitor search results and extract keyword gap matrices.',
                ogImage: 'https://analyzeserp.com/og-image.jpg',
                hasJsonLdSchema: true,
              }}
              targetUrl="https://analyzeserp.com"
            />
          </div>
        )}
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
