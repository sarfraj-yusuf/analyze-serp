'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, CheckCircle2, BookOpen, Lightbulb } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface StepItem {
  title: string;
  description: string;
}

export interface SEOContentSectionProps {
  toolName: string;
  title: string;
  description: string;
  steps: StepItem[];
  importanceTitle: string;
  importanceContent: string;
  faqs: FAQItem[];
}

export const SEOContentSection: React.FC<SEOContentSectionProps> = ({
  toolName,
  title,
  description,
  steps,
  importanceTitle,
  importanceContent,
  faqs,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Structured Data (FAQPage JSON-LD Schema)
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
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10 space-y-12">
      {/* Schema Script Injection */}
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Main Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SEO Knowledge & Tool Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-slate-700 dark:text-gray-200 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Step-by-Step How It Works Grid */}
      {steps.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>How to Use the {toolName}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2 relative overflow-hidden"
              >
                <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-extrabold text-lg">
                  0{idx + 1}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white pr-6">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-700 dark:text-gray-200 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why This Metric Matters */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 bg-gradient-to-br from-slate-900/5 via-slate-900/0 to-emerald-500/5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>{importanceTitle}</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
          {importanceContent}
        </p>
      </div>

      {/* Deep-Dive Editorial Content Depth Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/30">
            Deep-Dive Guide
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Competitor Analysis vs. Manual SEO Audits: Key Metrics That Drive Rankings
        </h3>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed space-y-3">
          <p>
            Executing an in-depth <strong className="text-slate-900 dark:text-white font-semibold">competitor analysis</strong> is the fastest way to understand why rival websites outrank your pages in Google search results. While traditional manual audits focus heavily on single-page technical checklists, a modern <strong className="text-slate-900 dark:text-white font-semibold">SEO competitor audit</strong> compares real-time SERP benchmarks across top-ranking competitors—revealing exact content gaps and search intent discrepancies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                1. Search Intent & Keyword Gap Extraction
              </h4>
              <p className="text-xs text-slate-700 dark:text-gray-200 leading-normal">
                Performing structured <strong className="text-slate-900 dark:text-white font-semibold">competitor research</strong> exposes 1-gram, 2-gram, and 3-gram phrase density patterns that top-ranking pages use to satisfy search intent. Spotting missing keyword variations allows you to expand topic coverage without keyword stuffing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-cyan-800 dark:text-cyan-300">
                2. SERP Title & Meta Tag Pixel Precision
              </h4>
              <p className="text-xs text-slate-700 dark:text-gray-200 leading-normal">
                Google truncates title tags exceeding 600 pixels. Comparing title tag pixel estimates and meta description lengths against top competitors ensures your SERP snippet avoids awkward ellipses and maximizes click-through rates (CTR).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-indigo-800 dark:text-indigo-300">
                3. Heading Tree & Content Outline Depth
              </h4>
              <p className="text-xs text-slate-700 dark:text-gray-200 leading-normal">
                Auditing H1, H2, and H3 heading hierarchies reveals how competitors structure complex topics. Identifying missing subheadings enables you to fill structural gaps and build comprehensive, authoritative content briefs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                4. Speed & Technical SEO Overhead
              </h4>
              <p className="text-xs text-slate-700 dark:text-gray-200 leading-normal">
                Side-by-side technical health benchmarking highlights response latency (TTFB), HTML document payload sizes, canonical tags, and robots.txt indexability—ensuring slow load times don't hinder your ranking potential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Accordion + FAQ Schema) */}
      {faqs.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glass-panel rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-controls={`faq-answer-${index}`}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-hidden={!isOpen}
                    className={`px-5 text-xs text-slate-600 dark:text-gray-300 border-t border-slate-100 dark:border-white/5 leading-relaxed transition-all duration-200 ${
                      isOpen ? 'block pb-4 pt-2' : 'hidden'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
