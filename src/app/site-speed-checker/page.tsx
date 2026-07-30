'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TechnicalHealthCard } from '@/components/TechnicalHealthCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { TechnicalAudit } from '@/types/seo';
import { Sparkles, ArrowLeft, Search, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SiteSpeedCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [technicalAudit, setTechnicalAudit] = useState<TechnicalAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      title: 'Enter Target Website URL',
      description: 'Enter any website URL to trigger server-side DOM fetch and latency timing.',
    },
    {
      title: 'Measure Time to First Byte (TTFB)',
      description: 'Record initial server responsiveness and network connection latency.',
    },
    {
      title: 'Audit Technical Core Web Vitals Signals',
      description: 'Check HTTPS encryption, mobile viewport readiness, DOM size, and image optimization.',
    },
  ];

  const faqs = [
    {
      question: 'What is Time to First Byte (TTFB) and why does it matter?',
      answer: 'TTFB measures how long it takes for a browser to receive the first byte of data from the web server. A fast TTFB (under 200ms) is essential for overall page load performance and Google ranking factors.',
    },
    {
      question: 'How does site speed affect SEO rankings?',
      answer: 'Google confirmed site speed as a direct ranking factor in Page Experience updates. Faster loading pages reduce bounce rates, increase session duration, and convert more visitors.',
    },
    {
      question: 'What are the main causes of slow website speed?',
      answer: 'Common causes include uncompressed large images, lack of browser caching, slow web hosting (high TTFB), render-blocking JavaScript, and un-minified CSS files.',
    },
  ];

  const handleCheckSpeed = async (e: React.FormEvent) => {
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
        throw new Error('Failed to audit technical site speed');
      }

      const data = await res.json();
      if (data.results && data.results[0] && data.results[0].status === 'success') {
        setTechnicalAudit(data.results[0].technicalAudit);
      } else {
        throw new Error(data.results[0]?.errorMessage || 'Failed to analyze technical health');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during speed analysis.');
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
          <span className="text-slate-900 dark:text-white font-bold">Site Speed Checker</span>
        </div>

        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Server Response & TTFB Speed Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Site Speed <span className="gradient-text">Audit Tool</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Test server response latency (TTFB), total fetch timing, HTTPS security configurations, and technical DOM performance in seconds.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleCheckSpeed} className="flex flex-col sm:flex-row items-center gap-3">
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
                <span>Auditing Speed...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Speed</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        </div>

        {technicalAudit && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Speed Audit Results</h3>
            <TechnicalHealthCard technicalAudit={technicalAudit} />
          </div>
        )}

        <SEOContentSection
          toolName="Site Speed Checker"
          title="Optimize Website Performance for Google Core Web Vitals"
          description="High page speed directly boosts search engine rankings, user conversion rates, and reduces page abandonment."
          steps={steps}
          importanceTitle="Why Page Speed & TTFB Matter for SEO Rankings"
          importanceContent={`Website speed is a direct Google ranking factor under Page Experience signals.

Key Speed Optimization Pillars:
1. Server TTFB: Ensure server response time stays under 200ms by utilizing fast hosting, edge caching, or CDN networks.
2. Lightweight DOM: Keep DOM tree size under 1,500 nodes to prevent memory bottlenecks during page rendering.
3. Image Compression: Compress heavy images to WebP/AVIF format to reduce page weight.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
