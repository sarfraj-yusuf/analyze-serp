'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ReadabilityCard } from '@/components/ReadabilityCard';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setMetrics(calculateReadability(val));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            Readability & <span className="gradient-text">Tone Analyzer</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Calculate the Flesch Reading Ease score ($0-100$) and target Grade Level in real-time to match ideal competitor readability standards.
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
      </main>

      <footer className="glass-panel border-t border-slate-200 dark:border-white/10 mt-16 py-6 text-center text-xs text-slate-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} SEO Matrix. Built with Next.js & Cheerio.</div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-gray-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Home</Link>
            <Link href="/readability" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Readability</Link>
            <Link href="/serp-simulator" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">SERP Simulator</Link>
          </div>
        </div>
      </footer>

      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
