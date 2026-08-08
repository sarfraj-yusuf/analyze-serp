'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LinkInspectorCard } from '@/components/LinkInspectorCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { LinkAudit } from '@/types/seo';
import { Sparkles, ArrowLeft, Search, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AffiliateLinkCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkAudit, setLinkAudit] = useState<LinkAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      title: 'Enter Webpage URL to Scan',
      description: 'Paste any affiliate article, review post, or blog page URL into the input bar.',
    },
    {
      title: 'Extract DOM Outbound Link Profile',
      description: 'Analyze all internal, external, affiliate, and branded links in real time.',
    },
    {
      title: 'Audit rel="sponsored" & rel="nofollow" Compliance',
      description: 'Verify if affiliate tracking URLs contain Google-compliant link attributes to avoid manual link penalties.',
    },
  ];

  const faqs = [
    {
      question: 'Why do affiliate links require rel="sponsored" or rel="nofollow"?',
      answer: 'Google Guidelines explicitly require paid or commercial links (including affiliate links) to use rel="sponsored" or rel="nofollow". Failing to label commercial links can lead to algorithmic link spam penalties.',
    },
    {
      question: 'How does the Affiliate Link Checker identify affiliate networks?',
      answer: 'Our scanner inspects target anchor destinations and URL tracking parameters for major networks like Amazon Associates, ShareASale, CJ Affiliate, Impact Radius, ClickBank, Rakuten, Awin, and custom affiliate parameters.',
    },
    {
      question: 'What is the difference between internal and external links?',
      answer: 'Internal links point to other pages within the exact same root domain, passing PageRank across your site. External links point to third-party domains.',
    },
  ];

  const handleInspectUrl = async (e: React.FormEvent) => {
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
        throw new Error('Failed to fetch link footprint data');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setLinkAudit(data.results[0].linkAudit);
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">Affiliate Link Checker</span>
        </div>

        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Outbound Link Footprint & Rel Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Affiliate Link <span className="gradient-text">Checker & Audit Tool</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Audit outbound link footprints, detect affiliate network parameters (Amazon, ShareASale, CJ, Impact), and check Google <code className="text-emerald-400 font-mono">rel="sponsored"</code> and <code className="text-cyan-400 font-mono">rel="nofollow"</code> compliance instantly.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleInspectUrl} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://example.com/best-product-reviews"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Inspecting DOM...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Links</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        </div>

        {linkAudit && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link Inspection Results</h3>
            <LinkInspectorCard linkAudit={linkAudit} />
          </div>
        )}

        <SEOContentSection
          toolName="Affiliate Link Checker"
          title="Protect Your Website from Google Link Spam Penalties"
          description="Ensure all monetized links follow Google Webmaster guidelines to maintain organic rankings and search engine trust."
          steps={steps}
          importanceTitle="Why Affiliate & Outbound Link Audits Matter for SEO"
          importanceContent={`Google's Link Spam Update actively penalizes sites that fail to properly label monetized and affiliate links.

Best Practices for Monetized Outbound Links:
1. rel="sponsored": Always apply to affiliate links, paid reviews, or sponsored content placements.
2. rel="nofollow": Use for un-vetted external links or user-generated content (UGC).
3. Anchor Text Ratio: Maintain natural anchor text variation instead of repetitive keyword-stuffed anchor text on affiliate redirects.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
