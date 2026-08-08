'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContrastPreviewController } from '@/components/ContrastPreviewController';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { ContrastReportData } from '@/lib/contrast-analyzer';
import { Palette, Sparkles, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { triggerToolExecutionFeedback } from '@/lib/feedback-trigger';

export default function ColorContrastCheckerPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ContrastReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      title: 'Enter Target Page URL',
      description: 'Enter any website URL to trigger server-side DOM parsing and CSS color pair extraction.',
    },
    {
      title: 'Compute W3C Relative Luminance & WCAG Ratios',
      description: 'Extract background/text pairs and calculate official WCAG 2.1 AA (4.5:1) and AAA (7.0:1) contrast ratios.',
    },
    {
      title: 'Tweak Live Color Controller & Apply Suggestions',
      description: 'Adjust Hex colors live in the interactive sandbox preview to achieve 100% WCAG visual accessibility compliance.',
    },
  ];

  const faqs = [
    {
      question: 'What is WCAG 2.1 Color Contrast Compliance?',
      answer: 'WCAG (Web Content Accessibility Guidelines) requires minimum visual contrast ratios between text and background colors ($4.5:1$ for normal text, $3.0:1$ for large text/buttons) to ensure readability for visually impaired users and overall user experience.',
    },
    {
      question: 'Why does color contrast matter for SEO and conversion rates?',
      answer: 'Search engines evaluate user experience signals and mobile readability. High contrast text reduces bounce rates, improves reader engagement, and increases CTA button conversion rates.',
    },
    {
      question: 'How does the Live Color Controller Sandbox work?',
      answer: 'You can select any audited color pair or pick custom Hex/RGB colors live. The interactive preview sandbox updates the UI button and text card in real-time, instantly calculating the WCAG AA/AAA pass status.',
    },
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contrast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to analyze color contrast.');
      }

      const json = await res.json();
      setReport(json.report);
      triggerToolExecutionFeedback();
    } catch (err: any) {
      setError(err.message || 'Unable to fetch target URL. Please verify the web address.');
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
            <Palette className="w-3.5 h-3.5" />
            <span>Website Color Contrast & WCAG Accessibility Inspector</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Website Color Contrast <br />
            <span className="gradient-text">& WCAG Compliance Checker</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Extract background, text, and button color pairs from any webpage URL. Audit W3C WCAG 2.1 AA/AAA contrast compliance and adjust colors in the live interactive sandbox preview.
          </p>
        </div>

        {/* Input Audit Box */}
        <div className="max-w-[830px] mx-auto w-full">
          <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-6">
            <form onSubmit={handleAudit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Enter Webpage URL to Check Color Contrast
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/landing-page"
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
                    <span>Extracting Colors & Calculating Ratios...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Audit Color Contrast & WCAG Ratios</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Audit Results & Interactive Live Controller */}
        {report && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <ContrastPreviewController report={report} />
          </div>
        )}

        <SEOContentSection
          toolName="Color Contrast Checker"
          title="Ensure High Readability & WCAG 2.1 Accessibility Compliance"
          description="Poor text and button contrast causes high bounce rates and accessibility failures. Audit visual contrast to boost user engagement."
          steps={steps}
          importanceTitle="Why Color Contrast Matters for SEO & User Conversions"
          importanceContent={`Text readability is a core component of user experience.
          
Key Contrast Benefits:
1. High Legibility: Compliant contrast ratios ($4.5:1$ for normal text) ensure readers can scan content effortlessly on all screens.
2. Higher Conversion Rates: Taller, high-contrast CTA buttons stand out visually, driving higher click-through rates.
3. WCAG 2.1 Accessibility: Adhering to W3C contrast standards prevents legal accessibility issues and improves audience reach.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
