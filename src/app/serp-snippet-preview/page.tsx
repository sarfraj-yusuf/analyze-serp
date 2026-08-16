'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SerpSocialSimulator } from '@/components/SerpSocialSimulator';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
  Sparkles,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Lightbulb,
  Users,
  Zap,
  ArrowRight,
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            SERP Snippet Preview Tool
          </span>
        </nav>

        {/* Hero Header Section */}
        <header className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pixel-Accurate Google Search Simulator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Google SERP Snippet <span className="gradient-text">Preview Tool</span> & Social Simulator
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Using an interactive <strong>google serp snippet preview tool</strong> allows webmasters to optimize page metadata prior to indexing. Use our real-time <strong>title tag pixel counter</strong>, <strong>meta description length checker</strong>, and <strong>social og card generator</strong> to eliminate awkward truncation ellipses (...) and maximize organic Click-Through Rates (CTR).
          </p>
        </header>

        {/* Layer 1: Interactive Web App Component (Top of Page Execution) */}
        <section aria-label="SERP Snippet Preview Tool Interface">
          <SerpSocialSimulator />
        </section>

        {/* Layer 2: 3-Step How-To-Use Visual Grid */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Usage Guide
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            How to Use the Google SERP Snippet Preview Tool
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 relative overflow-hidden shadow-sm"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Layer 3: Real-World Use Cases & CTR Optimization Benchmarks */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Use Cases & Benchmarks
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Real-World Use Cases & CTR Optimization Benchmarks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                Bloggers & Content Publishers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Mobile searchers scan titles in 1.2 seconds. Testing your <strong>serp snippet preview</strong> ensures your primary target keyword is front-loaded within the first 3 words before the tighter 580px mobile threshold cuts it off.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                E-Commerce & SaaS Product Teams
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Incorporating numbers, price anchors, brackets (e.g., <em>[2026 Review]</em>), and active CTAs into your <strong>meta description length checker</strong> workflow can boost organic click-through rate by up to 28%
                <a
                  href="https://backlinko.com/google-ctr-stats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 underline font-semibold ml-1 inline-flex items-center gap-0.5"
                >
                  [Backlinko CTR Study] <ExternalLink className="w-3 h-3 inline" />
                </a>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                Social Media & Growth Managers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                With our integrated <strong>social og card generator</strong>, verify that your <code>og:image</code> asset maintains a crisp 1.91:1 ratio (1200x630px) so shared links render full-width banners on LinkedIn, Facebook, and Twitter feeds.
              </p>
            </div>
          </div>
        </section>

        {/* Layer 4: Deep-Dive Technical Guide (~750 Words with Cited Stats & Google Docs Links) */}
        <article className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/20">
              Deep-Dive Technical Guide
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The Science of Google SERP Snippets: Pixel Math, Truncation Rules & Meta Rewrites
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. Why Character Counts Fail — The Title Tag Pixel Counter Math Explained
              </h3>
              <p>
                Many SEO beginners rely solely on static character count limits (such as "keep your title tag under 60 characters"). However, Google’s search engine rendering container does not count characters—it measures element width in <strong>pixels</strong>.
              </p>
              <p>
                On Google Desktop, the maximum title link container is capped at <strong>600 pixels</strong> (rendered in Arial 20px font). On Mobile devices, the container width scales down to approximately <strong>580 pixels</strong>. Because letters are proportionally spaced, individual characters occupy variable pixel widths:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li>A capital <strong>'W'</strong> occupies <strong>13 pixels</strong>.</li>
                <li>A capital <strong>'M'</strong> occupies <strong>11 pixels</strong>.</li>
                <li>A lowercase <strong>'i'</strong> or <strong>'l'</strong> occupies only <strong>4 pixels</strong>.</li>
              </ul>
              <p>
                If a title tag contains multiple wide characters ("W", "M", "O"), it may get truncated at 52 characters. Conversely, titles containing narrow letters ("i", "t", "l") can safely reach 65 characters without trailing ellipses (...).
              </p>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/appearance/title-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Title Link Guidelines <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. Why Google Rewrites Meta Descriptions (~60-70% Data Study)
              </h3>
              <p>
                A comprehensive search study by Ahrefs analyzing 1.4 million search queries revealed that Google dynamically replaces written meta descriptions roughly <strong>62.6% of the time</strong>
                <a
                  href="https://ahrefs.com/blog/google-rewrites-meta-descriptions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold ml-1 inline-flex items-center gap-0.5"
                >
                  [Ahrefs Meta Description Study] <ExternalLink className="w-3 h-3 inline" />
                </a>.
              </p>
              <p>
                Google’s automated snippet generator overrides custom metadata for three main reasons:
              </p>
              <ol className="list-decimal pl-6 space-y-1.5 text-xs">
                <li>
                  <strong>Search Query Mismatch</strong>: If a user enters a long-tail search query that exists inside your webpage content but is absent from your meta description, Google automatically extracts a matching paragraph snippet from your body text.
                </li>
                <li>
                  <strong>Thin or Incomplete Descriptions</strong>: Meta descriptions under 70 characters are frequently discarded by Google in favor of longer page extracts.
                </li>
                <li>
                  <strong>Repetitive Keyword Stuffing</strong>: Meta descriptions that unnaturally repeat keywords trigger automated snippet replacement.
                </li>
              </ol>
              <div className="pt-1">
                <a
                  href="https://developers.google.com/search/docs/appearance/snippet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Control Your Search Snippets Guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. Title Tag CTR Hooks: Bracket Power, Numbers & Search Intent
              </h3>
              <p>
                Top-ranking pages don’t just optimize for search crawlers—they write for human psychology. Industry benchmarks from Backlinko’s analysis of 5 million search engine results confirm that title tags containing brackets <code>[ ]</code> achieve a <strong>38% higher relative CTR</strong> compared to titles without brackets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">❌ Weak / Low-CTR Title</span>
                  <p className="font-mono text-xs text-slate-700 dark:text-gray-300">
                    SEO Audit Tool for Website Owners To Check Their Site Performance
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    (Vague, no brand anchor, missing current year, generic wording)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✅ High-CTR / Pixel-Optimized Title</span>
                  <p className="font-mono text-xs text-slate-700 dark:text-gray-300">
                    [Free Audit] On-Page SEO Competitor Analysis Tool (2026) | AnalyzeSERP
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    (580px width, bracket hook, current year, brand anchor)
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                4. Open Graph (OG) Protocols and Twitter Card Markup
              </h3>
              <p>
                When users share your web page on LinkedIn, Facebook, WhatsApp, or Twitter/X, social platform crawlers scan your HTML <code>&lt;head&gt;</code> tags for Open Graph protocol metadata:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><code>&lt;meta property="og:title" content="..."&gt;</code>: Social headline (recommended max 90 characters).</li>
                <li><code>&lt;meta property="og:description" content="..."&gt;</code>: Social summary text (recommended max 200 characters).</li>
                <li><code>&lt;meta property="og:image" content="..."&gt;</code>: High-resolution preview image asset (1200x630px).</li>
                <li><code>&lt;meta name="twitter:card" content="summary_large_image"&gt;</code>: Directs Twitter/X to render full-width visual card banners.</li>
              </ul>
            </section>
          </div>
        </article>

        {/* Dedicated Internal Cross-Link Section: Explore Related AnalyzeSERP Tools */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Related AnalyzeSERP Tools
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Explore Related SEO & Content Optimization Utilities
          </h3>

          <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
            Pair your SERP snippet optimization with our complete suite of free SEO tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            <Link
              href="/affiliate-link-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Affiliate Auditor</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Audit rel="sponsored".
                </p>
              </div>
            </Link>

            <Link
              href="/technical-health"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Technical Health</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Audit SSL & indexation.
                </p>
              </div>
            </Link>

            <Link
              href="/readability"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Readability</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Analyze Flesch grade.
                </p>
              </div>
            </Link>

            <Link
              href="/redirect-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Redirect Auditor</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Trace 301/302 HTTP chains.
                </p>
              </div>
            </Link>

            <Link
              href="/contrast-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Color Contrast</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Test W3C WCAG contrast.
                </p>
              </div>
            </Link>

            <Link
              href="/site-speed-checker"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Site Speed</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Test TTFB & Core Web Vitals.
                </p>
              </div>
            </Link>

            <Link
              href="/pdf-reports"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>PDF Reports</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Build white-label audits.
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>Competitor Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Compare 5 competitor URLs.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Layer 5: Frequently Asked Questions Accordion + JSON-LD Schema */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions About SERP Snippets
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-controls={`faq-answer-${index}`}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
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
                      className="px-6 pb-4 pt-2 text-xs text-slate-600 dark:text-gray-300 border-t border-slate-100 dark:border-white/5 leading-relaxed"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}

