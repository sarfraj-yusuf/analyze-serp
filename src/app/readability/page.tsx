'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReadabilityCard } from '@/components/ReadabilityCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { calculateReadability } from '@/lib/readability';
import { ReadabilityMetrics } from '@/types/seo';
import { BookOpen, Sparkles, ArrowLeft, AlignLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReadabilityPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [inputText, setInputText] = useState(
    `On-page SEO is the practice of optimizing web page content for search engines and users. Common on-page SEO practices include optimizing title tags, content, internal links and URLs. Content writers should aim for plain, accessible language to increase user engagement and lower bounce rates.`
  );

  const [metrics, setMetrics] = useState<ReadabilityMetrics>(calculateReadability(inputText));

  const steps = [
    {
      title: 'Paste Text or Article Draft',
      description: 'Paste your content draft, blog post, or article text directly into the live text editor.',
    },
    {
      title: 'Real-Time Syllable & Sentence Analysis',
      description: 'Watch the algorithm calculate average words per sentence, syllable distribution, and Flesch Reading Ease in real time.',
    },
    {
      title: 'Optimize Content Grade Level',
      description: 'Adjust sentence lengths and replace complex multi-syllable jargon to reach the ideal 7th-8th Grade level for web readers.',
    },
  ];

  const faqs = [
    {
      question: 'What is the Flesch Reading Ease score?',
      answer: 'The Flesch Reading Ease test measures textual difficulty on a 0 to 100 scale. Higher scores indicate material that is easier to read. Standard web content should target a score between 60.0 and 70.0 (8th to 9th grade level).',
    },
    {
      question: 'Does content readability affect SEO rankings?',
      answer: 'Yes. Readable content improves user engagement, reduces bounce rates, and increases dwell time. Search engines favor content that answers user queries clearly without unnecessary syntactic complexity.',
    },
    {
      question: 'How is the Flesch-Kincaid Grade Level calculated?',
      answer: 'Flesch-Kincaid Grade Level evaluates average sentence length (words per sentence) and average syllables per word to match US grade school education levels.',
    },
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setMetrics(calculateReadability(val));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">Readability & Tone Analyzer</span>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flesch-Kincaid Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Free Flesch Readability <span className="gradient-text">Score Checker</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Calculate Flesch Reading Ease score (0-100), Flesch-Kincaid Grade Level, and sentence complexity metrics in real-time.
          </p>
        </div>

        {/* Text Input Editor */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
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
        </div>

        {/* Readability Results Card */}
        <ReadabilityCard readability={metrics} />

        <SEOContentSection
          toolName="Flesch Readability Score Checker"
          title="Optimize Content Readability & User Dwell Time"
          description="Web users scan content. Writing at an accessible grade level keeps users engaged and lowers bounce rates."
          steps={steps}
          importanceTitle="Why Flesch Readability Matters for Content Marketing & SEO"
          importanceContent={`Search engine algorithms measure user engagement signals (dwell time, scroll depth, bounce rate). Complex syntax and overly dense paragraphs frustrate readers, causing them to bounce back to search results.

Key Readability Targets:
1. Target Flesch Score: 60 to 70 (Plain English, easily understood by 13-to-15-year-old students).
2. Sentence Length: Keep average sentence length under 20 words.
3. Syllable Ratio: Minimize complex words (words with 3+ syllables) to under 10% of total word count.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
