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

export interface GuideItem {
  title: string;
  description: string;
}

export interface GuideSectionData {
  tag?: string;
  title: string;
  intro?: string;
  items: GuideItem[];
}

export interface SEOContentSectionProps {
  toolName: string;
  title: string;
  description: string;
  steps: StepItem[];
  importanceTitle: string;
  importanceContent: string;
  faqs: FAQItem[];
  guideSection?: GuideSectionData | null;
}

const defaultCompetitorGuide: GuideSectionData = {
  tag: 'METHODOLOGY DEEP-DIVE',
  title: 'Competitor Analysis vs. Manual SEO Audits: Key Metrics That Drive Rankings',
  intro:
    'Executing an in-depth competitor analysis is the fastest way to understand why rival websites outrank your pages in Google search results. While traditional manual audits focus heavily on single-page technical checklists, a modern SEO competitor audit benchmarks real-time SERP signals across top-ranking competitors—revealing exact content gaps and search intent discrepancies.',
  items: [
    {
      title: 'Search Intent & Keyword Gap Extraction',
      description:
        'Structured competitor research exposes 1-gram, 2-gram, and 3-gram phrase density patterns that top-ranking pages use to satisfy search intent. Spotting missing keyword variations allows you to expand topic coverage naturally.',
    },
    {
      title: 'SERP Title & Meta Tag Pixel Precision',
      description:
        'Google truncates title tags exceeding 600 pixels. Comparing title tag pixel estimates and meta description lengths against top competitors ensures your snippet avoids ellipses and maximizes click-through rates (CTR).',
    },
    {
      title: 'Heading Tree & Content Outline Depth',
      description:
        'Auditing H1, H2, and H3 heading hierarchies reveals how competitors structure complex topics. Identifying missing subheadings enables you to fill structural gaps and build comprehensive content briefs.',
    },
    {
      title: 'Speed & Technical Health Overhead',
      description:
        'Side-by-side technical health benchmarking highlights response latency (TTFB), document payload sizes, canonical tags, and robots indexability—ensuring technical friction never limits your rankings.',
    },
  ],
};

export const SEOContentSection: React.FC<SEOContentSectionProps> = ({
  toolName,
  title,
  description,
  steps,
  importanceTitle,
  importanceContent,
  faqs,
  guideSection,
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

  const activeGuide = guideSection === undefined ? defaultCompetitorGuide : guideSection;

  return (
    <section className="mt-20 pt-16 border-t border-slate-200/80 dark:border-white/[0.08]">
      {/* Schema Script Injection */}
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-16">
        {/* Main Section Header */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SEO KNOWLEDGE & TOOL GUIDE</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100"
            style={{ textWrap: 'balance' }}
          >
            {title}
          </h2>
          <p
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed"
            style={{ textWrap: 'pretty' }}
          >
            {description}
          </p>
        </div>

        {/* Step-by-Step How It Works Grid */}
        {steps.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-1">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                How to Use the {toolName}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-white/[0.08] relative flex flex-col justify-between transition-all duration-200 hover:border-emerald-500/30 dark:hover:border-emerald-500/30"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]">
                        STEP 0{idx + 1}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                      {step.title}
                    </h4>
                    <p
                      className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                      style={{ textWrap: 'pretty' }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why This Metric Matters / Strategic Benchmark */}
        <div className="glass-panel p-6 sm:p-8 rounded-xl border border-slate-200/80 dark:border-white/[0.08] border-l-4 border-l-emerald-500 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Strategic Benchmark</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {importanceTitle}
          </h3>
          <div
            className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-3.5"
            style={{ textWrap: 'pretty' }}
          >
            {importanceContent.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Deep-Dive Guide Section */}
        {activeGuide && (
          <div className="space-y-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{activeGuide.tag || 'DEEP-DIVE GUIDE'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {activeGuide.title}
              </h3>
              {activeGuide.intro && (
                <p
                  className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl"
                  style={{ textWrap: 'pretty' }}
                >
                  {activeGuide.intro}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGuide.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] space-y-2 transition-all duration-200 hover:border-slate-300 dark:hover:border-white/15"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      {item.title}
                    </h4>
                  </div>
                  <p
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                    style={{ textWrap: 'pretty' }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions (Accordion + FAQ Schema) */}
        {faqs.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-1">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-3">
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
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 transition-colors"
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
                      className={`px-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-all duration-200 ${
                        isOpen ? 'block pb-4 pt-1 border-t border-slate-100 dark:border-white/5' : 'hidden'
                      }`}
                      style={{ textWrap: 'pretty' }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
