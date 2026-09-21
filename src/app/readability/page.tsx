'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReadabilityCard } from '@/components/ReadabilityCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { calculateReadability } from '@/lib/readability';
import { ReadabilityMetrics } from '@/types/seo';
import { CompactToolDock } from '@/components/CompactToolDock';
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
          <span className="text-slate-800 dark:text-slate-100 font-medium">Readability Analyzer</span>
        </nav>

        {/* Compact Centered App-First Header */}
        <header className="space-y-2 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3 h-3" />
            <span>Flesch-Kincaid Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 [letter-spacing:-0.025em]">
            Readability Score &amp; Tone Analyzer
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Calculate Flesch Reading Ease (0–100), Flesch-Kincaid Grade Level, and sentence complexity in real time to satisfy Google Helpful Content readability guidelines.
          </p>
        </header>

        {/* Layer 1: Text Input Editor & Live Results */}
        <section aria-label="Live Article Text Editor Input" className="max-w-4xl mx-auto space-y-6">
          <div className="glass-panel hero-input-dock p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Live Article Draft / Copy Editor</span>
              </span>
              <span className="text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                {metrics.totalSentences} sentences · {metrics.avgSentenceLength} avg words/sent
              </span>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={handleTextChange}
              placeholder="Paste your article draft or content text here..."
              className="w-full p-4 rounded-xl glass-input text-xs sm:text-sm leading-relaxed focus:outline-none shadow-xs resize-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.05] text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero data logging · Client-side analysis</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">Target: 60–70 Flesch Ease · 7th–8th Grade</span>
            </div>
          </div>

          <div className="animate-in fade-in duration-200">
            <ReadabilityCard readability={metrics} />
          </div>
        </section>

        {/* Editorial SEO & Readability Knowledge Container */}
        <div className="max-w-5xl mx-auto w-full space-y-16 pt-10 border-t border-slate-200/80 dark:border-white/[0.08]">
          {/* 1. 3-Step How-To-Use Workflow */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Usage & Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                How to Use the Readability Score Checker
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analyze text complexity, calibrate grade levels, and improve reader dwell time in 3 simple steps.
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
                  <strong>Content Writers:</strong> Prevent mobile reader drop-offs with 7th–8th grade prose
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>SEO Copywriters:</strong> Align content with Google Helpful Content guidelines
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Marketing Teams:</strong> Simplify sales landing copy to lift conversions +14%
                </span>
              </div>
            </div>
          </section>

          {/* 2. 4-Pillar Readability & Comprehension Architecture (2x2 Bento Grid) */}
          <section className="space-y-6">
            <div className="space-y-2 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Linguistic Science</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                The Science of Readability: Formulas, Grade Levels & Dwell Time
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Objective linguistic formulas that predict user comprehension, reading fatigue, and search intent satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Flesch Reading Ease Formula */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Reading Ease
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      60–70 Target
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    1. Flesch Reading Ease Index
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Flesch Reading Ease scores text accessibility on a 0–100 scale using word length and syllable density. Higher scores represent clearer, more conversational prose suited for digital audiences.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Plain English (Web Optimal):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">60–70 Score</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Fairly Difficult (High School):</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">50–60 Score</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Technical / Academic:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">&lt; 50 Score</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Flesch-Kincaid Formula Specifications & Mathematics</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 2: Flesch-Kincaid Grade Level */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Education Benchmark
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      7th–8th Grade
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    2. Flesch-Kincaid Grade Level
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Translates raw linguistic complexity into US academic grade equivalents. Research demonstrates that web copy written at a 7th–8th grade level maximizes comprehension across all demographics.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Target Web Grade:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">7th–8th Grade</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Advanced Web Grade:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">9th–10th Grade</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>High Fatigue Risk:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">12th+ Grade</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Helpful Content System</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 3: Sentence Length & Dwell Time */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <AlignLeft className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Cognitive Load
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                      15–20 Words/Sent
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    3. Sentence Length & Dwell Time Psychology
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Comprehension studies by the American Press Institute show that readers understand 90% of content when sentences average 14 words, dropping below 10% when sentences exceed 40 words.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Comprehension (&le; 14 words):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">~90% Comprehension</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Comprehension (~20 words):</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">~75% Comprehension</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Comprehension (40+ words):</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">&lt; 10% Comprehension</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.americanpressinstitute.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>American Press Institute Readability & Clarity Research</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card 4: Search Intent & Conversion Impact */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Search Signals
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                      Lower Bounce Rates
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    4. Search Intent & Conversion Lift
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Google's ranking systems prioritize content that answers search intent without friction. Plain, clear writing reduces reader abandonment, directly supporting engagement and conversion metrics.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Mobile Bounce Rate:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Up to -22% Reduction</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Average Dwell Time:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Significant Increase</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span>Conversion Rate Lift:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Up to +14% Lift</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://developers.google.com/search/docs/appearance/ranking-systems-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Google Search Central Ranking Systems Guide</span>
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
                Frequently Asked Questions About Content Readability
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Essential insights into Flesch scores, syllable counts, and Google Helpful Content benchmarks.
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
          <CompactToolDock currentTool="readability" />
        </div>
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
