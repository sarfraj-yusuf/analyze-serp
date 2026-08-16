'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReadabilityCard } from '@/components/ReadabilityCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { calculateReadability } from '@/lib/readability';
import { ReadabilityMetrics } from '@/types/seo';
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  AlignLeft,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Users,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function ReadabilityPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [inputText, setInputText] = useState(
    `On-page SEO is the practice of optimizing web page content for search engines and users. Common on-page SEO practices include optimizing title tags, content, internal links and URLs. Content writers should aim for plain, accessible language to increase user engagement and lower bounce rates.`
  );

  const [metrics, setMetrics] = useState<ReadabilityMetrics>(calculateReadability(inputText));
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      title: '01. Paste Article Draft or Text Snippet',
      description:
        'Paste your blog article draft, marketing copy, or text snippet directly into the live interactive text editor.',
    },
    {
      title: '02. Real-Time Syllable & Sentence Analysis',
      description:
        'Our algorithm automatically calculates average words per sentence, syllable distribution, and Flesch Reading Ease scores as you type.',
    },
    {
      title: '03. Optimize Grade Level for Google Helpful Content',
      description:
        'Adjust sentence lengths and replace complex multi-syllable jargon to reach the optimal 7th–8th Grade level for web readers.',
    },
  ];

  const faqs = [
    {
      question: 'What is a readability score checker tool?',
      answer:
        'A readability score checker tool evaluates written content using statistical formulas like Flesch Reading Ease and Flesch-Kincaid Grade Level to measure sentence complexity, syllable distribution, and reading difficulty.',
    },
    {
      question: 'What is the Flesch Reading Ease score and how is it calculated?',
      answer:
        'The Flesch Reading Ease score measures text accessibility on a 0–100 scale based on total words, total sentences, and total syllables. A score of 60 to 70 represents plain English suitable for web audiences.',
    },
    {
      question: 'What is the ideal target grade level for online blog articles?',
      answer:
        'Most web content should target a 7th to 8th-grade reading level. This allows general readers to digest information quickly without encountering unnecessary syntactic friction.',
    },
    {
      question: 'Why does high passive voice ratio negatively affect user engagement?',
      answer:
        'Passive voice makes sentences longer and less direct. Active voice communicates ideas clearly and keeps readers engaged, reducing bounce rates on mobile devices.',
    },
    {
      question: 'Does Google use readability as a direct search ranking factor?',
      answer:
        'Google does not use Flesch scores directly as a binary ranking factor, but readability directly impacts user engagement signals (dwell time, scroll depth, bounce rate), which influence Google\'s Helpful Content System algorithms.',
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setMetrics(calculateReadability(val));
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
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            Readability & Tone Analyzer
          </span>
        </nav>

        {/* Page Hero Header */}
        <header className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flesch-Kincaid Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Readability <span className="gradient-text">Score Checker & Auditor</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Using an online <strong>readability score checker</strong> allows writers and SEO copywriters to run a <strong>flesch kincaid grade level auditor</strong> in real time. Calculate Flesch Reading Ease (0–100), analyze <strong>passive voice ratio detector</strong> metrics, and streamline paragraph complexity to satisfy <strong>google helpful content readability</strong> guidelines.
          </p>
        </header>

        {/* Layer 1: Text Input Editor & Live Results */}
        <section aria-label="Live Article Text Editor Input">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Live Article Draft / Text Box
              </span>
              <span className="text-slate-500 dark:text-gray-400 font-mono">
                {metrics.totalSentences} sentences • {metrics.avgSentenceLength} avg words/sent
              </span>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={handleTextChange}
              placeholder="Paste your article draft or content text here..."
              className="w-full p-4 rounded-xl glass-input text-xs leading-relaxed focus:outline-none shadow-sm resize-none"
            />

            {/* Privacy Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy & Security Guarantee:</strong> Your analyzed text and URLs are processed transiently in real time. We do not store, log, or use your copy for AI model training.
              </span>
            </div>
          </div>

          <div className="mt-8">
            <ReadabilityCard readability={metrics} />
          </div>
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
            How to Use the Readability Score Checker
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

        {/* Layer 3: Real-World Persona Use Cases */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Use Cases & Benchmarks
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Real-World Use Cases for Readability & Content Optimization
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                Content Writers & Bloggers
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Maximize reader dwell time. Using our <strong>content complexity analyzer</strong> helps keep sentence lengths under control, preventing mobile readers from bouncing back to search engine results.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-cyan-600 dark:text-cyan-400">
                SEO Copywriters & Marketing Agencies
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Align articles with Google expectations. Ensure client blog content remains accessible to general audiences while maintaining high topical authority.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm text-indigo-600 dark:text-indigo-400">
                Technical Publishers & Editors
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                Simplify complex technical tutorials into plain English. Replace unnecessary multi-syllable jargon with direct vocabulary without losing technical depth.
              </p>
            </div>
          </div>
        </section>

        {/* Layer 4: Deep-Dive Technical Guide (~800 Words with Cited Stats & Google Docs Links) */}
        <article className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/20">
              Deep-Dive Technical Guide
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The Science of Readability: Flesch Metrics, User Dwell Time & Google Helpful Content
          </h2>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                1. The Flesch Reading Ease Score Scale (0 to 100 Benchmark)
              </h3>
              <p>
                The Flesch Reading Ease formula evaluates textual difficulty on a scale from 0 to 100. Higher scores denote material that is easier to comprehend:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>90.0 – 100.0</strong>: 5th Grade level (Very Easy to Read)</li>
                <li><strong>60.0 – 70.0</strong>: 8th & 9th Grade level (Plain English — Target Benchmark for Web Content)</li>
                <li><strong>0.0 – 30.0</strong>: University Graduate level (Very Confusing / Dense Academic Jargon)</li>
              </ul>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. Flesch-Kincaid Grade Level & Web Reading Behavior (NNGroup 79% Study)
              </h3>
              <p>
                User experience research conducted by the Nielsen Norman Group reveals that <strong>79% of web users scan pages</strong> rather than reading line-by-line
                <a
                  href="https://www.nngroup.com/articles/how-users-read-on-the-web/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold ml-1 inline-flex items-center gap-0.5"
                >
                  [Nielsen Norman Group Reading Study] <ExternalLink className="w-3 h-3 inline" />
                </a>.
                Writing at a 7th–8th grade reading level enables searchers to locate key answers instantly, driving higher dwell time and lower bounce rates.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                3. Passive Voice Ratio & Sentence Length Optimization
              </h3>
              <p>
                Excessive passive voice construction lengthens sentence structures and reduces reader comprehension. Maintaining average sentence lengths under 20 words and keeping passive voice under 10% ensures energetic, authoritative content delivery across mobile devices.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                4. Google Helpful Content System & User Engagement Signals
              </h3>
              <p>
                Google’s official Webmaster Quality guidelines emphasize producing content created for human searchers rather than search engine algorithms. Clear, accessible writing prevents reader friction, directly contributing to positive engagement signals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="https://developers.google.com/search/docs/appearance/helpful-content-system"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Search Central Helpful Content System Guidance <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline inline-flex items-center gap-1"
                >
                  Official Reference: Google Fundamentals for Creating Helpful Content <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>
          </div>
        </article>

        {/* Layer 5: Dedicated Internal Cross-Linking Section: Explore Related AnalyzeSERP Tools */}
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
            Enhance your content quality by combining readability audits with our complete suite of free SEO tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            <Link
              href="/serp-snippet-preview"
              className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <span>SERP Preview</span>
                  <ArrowRight className="w-3 h-3" />
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                  Test title tag width & meta.
                </p>
              </div>
            </Link>

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

        {/* Layer 6: Frequently Asked Questions Accordion + JSON-LD Schema */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions About Content Readability
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
