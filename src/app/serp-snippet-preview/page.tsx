'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SerpSocialSimulator } from '@/components/SerpSocialSimulator';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { CompactToolDock } from '@/components/CompactToolDock';
import {
  Sparkles,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  Users,
  Zap,
  ArrowRight,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function SerpSnippetPreviewPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Input Title Tag & Meta Description',
      description:
        'Type or paste your proposed title tag, meta description, and destination URL into the interactive input panel above.',
    },
    {
      title: '02. Monitor Real-Time Pixel Meters',
      description:
        'Watch our title tag pixel counter enforce the 600px desktop limit and our meta description length checker ensure you stay under 960px (~155 chars).',
    },
    {
      title: '03. Preview Search & Social Cards',
      description:
        'Switch seamlessly between Google Desktop SERP, Mobile SERP, Facebook, and Twitter/X Open Graph preview cards before publishing.',
    },
  ];

  const faqs = [
    {
      question: 'What is a Google SERP snippet preview tool?',
      answer:
        'A Google SERP snippet preview tool is an interactive search engine simulator that enables webmasters, SEO copywriters, and content creators to test how title tags, meta descriptions, and page URLs will appear on Google Desktop and Mobile search results pages before publishing content live.',
    },
    {
      question: 'What is the exact title tag length limit in pixels for Google?',
      answer:
        'Google limits title tag display width to 600 pixels on Desktop search results (approximately 55 to 60 characters) and around 580 pixels on Mobile devices. Titles exceeding this pixel width are truncated with an ellipsis (...).',
    },
    {
      question: 'Why does Google rewrite meta descriptions and title tags?',
      answer:
        'According to search data studies, Google dynamically rewrites meta descriptions roughly 60% to 70% of the time when it determines that custom metadata does not adequately match the user search query or when the metadata is thin, repetitive, or missing.',
    },
    {
      question: 'What is the difference between Google Desktop and Mobile search previews?',
      answer:
        'Google Desktop SERP displays title tags up to 600px width with two-line meta descriptions up to 960px (~155–160 chars). Mobile SERP renders larger favicon icons, full-width domain breadcrumbs, and tighter 580px title limits.',
    },
    {
      question: 'Do meta descriptions directly impact Google search rankings?',
      answer:
        'Meta descriptions are not a direct Google algorithmic ranking factor. However, a compelling, keyword-rich meta description significantly improves organic Click-Through Rate (CTR), which drives more traffic and positive user engagement signals.',
    },
  ];

  // FAQPage JSON-LD Structured Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      {/* FAQ Schema Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audit Suite</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">SERP Snippet Preview</span>
        </nav>

        {/* Compact Centered App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Share2 className="w-3 h-3" />
            <span>SERP &amp; Social Simulator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Google SERP Snippet &amp; Social Card Preview
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Test title tag pixel width (600px desktop / 580px mobile), meta description length, and Open Graph social preview cards in real time to prevent truncation and maximize organic CTR.
          </p>
        </header>

        {/* Top-Fold Interactive Sandbox */}
        <section aria-label="SERP Snippet Preview Tool Interface" className="max-w-5xl mx-auto">
          <SerpSocialSimulator />
        </section>

        {/* Editorial SEO & Snippet Knowledge Container */}
        <div className="max-w-5xl mx-auto w-full space-y-16 pt-10 border-t border-slate-200/80 dark:border-white/[0.08]">
          {/* 1. 3-Step How-To-Use Workflow */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Usage & Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                How to Use the Google SERP Snippet Preview Tool
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Test title tag pixel width, meta description truncation, and social share previews in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2 relative shadow-xs"
                >
                  <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]">
                    STEP 0{idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    {step.title.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Persona Target Chips */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Who Uses This:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Content Publishers:</strong> Front-load target keywords within the 580px mobile cut
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>E-Commerce Teams:</strong> Test price brackets & numbers to boost CTR up to +28%
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Social Marketers:</strong> Validate 1.91:1 Open Graph cards for LinkedIn & X
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar SERP & Snippet Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Snippet Science</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Science of Google SERP Snippets: Pixel Math & Truncation Rules
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Why static character counters fail, how Google rewrites descriptions, and how pixel optimization drives organic CTR.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Desktop vs Mobile Pixel Caps */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Pixel Precision
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      600px / 580px Cap
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. The Mathematics of Pixel Width Limits
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Google renders titles in Arial 20px proportional font. Because "W" takes 18px and "i" takes 4px, character counts fail. Google truncates titles that exceed 600px on desktop or 580px on mobile.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Desktop Title Max Width:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">600 Pixels</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Mobile Title Cutoff:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">~580 Pixels</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Meta Description Width:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">~960px (~155 chars)</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/appearance/title-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Title Link Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: Meta Description Rewrites */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Algorithm Insight
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      62.6% Rewrite Rate
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. Google Meta Description Rewrites
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    An industry study of 1.2M queries revealed Google rewrites meta descriptions 62.6% of the time if they fail to address search intent. Front-loading keywords ensures Google displays your crafted copy.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Query Alignment:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Matches User Intent</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Front-Loaded Keyword:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Within First 100 Chars</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Tone & Substance:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Factual, No Keyword Stuffing</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/appearance/snippets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Snippet Creation Guidelines</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: Social Cards (Open Graph & Twitter) */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Social Signals
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                      1.91:1 Social Ratio
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. Open Graph & Twitter Social Metadata
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Social feeds require specific meta tag formats. Verify that <code>og:title</code>, <code>og:description</code>, and <code>og:image</code> render without clipping on LinkedIn, Facebook, and X.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>OG Image Optimal Size:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">1200 &times; 630px</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Twitter Card Format:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">summary_large_image</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Social Engagement:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Up to +38% Higher CTR</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://ogp.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>The Open Graph Protocol Official Specification</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: CTR Optimization Formula */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        CTR Formula
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                      +28% CTR Uplift
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. CTR Psychology & Conversion Hooks
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Extensive search studies demonstrate that incorporating numbers, current year brackets (e.g. <em>[2026]</em>), and active solution verbs directly drives higher organic click-through rates.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Brackets / Parentheses:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+28% CTR Uplift</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Searcher Scan Speed:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">1.2 Seconds per Snippet</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Truncation Risk:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">Ellipses Reduce Clicks</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://backlinko.com/google-ctr-stats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Backlinko Organic Search Click-Through Rate Study</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* 3. Frequently Asked Questions (Accordion) */}
          <section className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Common Questions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Frequently Asked Questions About Google SERP Snippets
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Essential insights into pixel width limits, truncation prevention, and Open Graph previews.
              </p>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-xl border transition-colors duration-150 ${
                      isOpen
                        ? 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-300 dark:border-white/15'
                        : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      aria-controls={`faq-answer-${index}`}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-500' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-hidden={!isOpen}
                        className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 leading-relaxed"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Complementary Diagnostic Engines */}
          <CompactToolDock currentTool="serp-snippet-preview" />
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}

