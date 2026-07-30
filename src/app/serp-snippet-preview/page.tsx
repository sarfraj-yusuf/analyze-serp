'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SerpSocialSimulator } from '@/components/SerpSocialSimulator';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SerpSnippetPreviewPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const steps = [
    {
      title: 'Enter Target Title Tag & Meta Description',
      description: 'Type or paste your page title tag and meta description into the input fields.',
    },
    {
      title: 'Monitor Pixel Count & Truncation Warnings',
      description: 'Watch the real-time pixel counter ensure your title stays under 600px (~60 chars) and meta description under 960px (~155 chars).',
    },
    {
      title: 'Preview Desktop, Mobile & Social Cards',
      description: 'Switch between Google Desktop SERP, Mobile SERP, and Open Graph Social Card previews instantly.',
    },
  ];

  const faqs = [
    {
      question: 'What is a Google SERP Snippet Preview Tool?',
      answer: 'A Google SERP Snippet Preview Tool is an interactive simulator that shows how your title tag, URL, and meta description will appear on Google search results pages before you publish your page.',
    },
    {
      question: 'Why does Google truncate title tags?',
      answer: 'Google measures title tags in pixels rather than character counts. On desktop, title tags are cut off at approximately 600 pixels (roughly 55–60 characters). On mobile, limit is around 580 pixels.',
    },
    {
      question: 'How long should a meta description be for SEO?',
      answer: 'Optimal meta description length is between 140 to 160 characters (up to 960 pixels on desktop). Descriptions longer than this are truncated with ellipses (...) by Google.',
    },
    {
      question: 'Will Google always use my meta description?',
      answer: 'No. Google dynamically replaces meta descriptions roughly 60% of the time if it finds content on your page that better matches the user search query. However, writing high-CTR meta descriptions remains a fundamental SEO best practice.',
    },
  ];

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
          <span className="text-slate-900 dark:text-white font-bold">SERP Snippet Preview Tool</span>
        </div>

        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Search Result Snippet Preview</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Google SERP Snippet <span className="gradient-text">Preview Generator</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Optimize your title tags, meta descriptions, and URLs for maximum click-through rates (CTR). Preview live Google desktop and mobile search snippet previews with pixel-accurate length checks.
          </p>
        </div>

        <SerpSocialSimulator />

        <SEOContentSection
          toolName="Google SERP Snippet Preview Tool"
          title="Master Search Engine Result Page (SERP) Optimization"
          description="Understand how pixel lengths, truncation rules, and rich snippet elements impact your organic click-through rates on Google and Bing."
          steps={steps}
          importanceTitle="Why Meta Title & Description Optimization Matters for SEO"
          importanceContent={`Your search engine result snippet is your page's digital billboard. Even if your webpage ranks #1 on Google, an unoptimized, truncated, or uncompelling title tag will drastically lower your organic Click-Through Rate (CTR).

Key SERP Optimization Standards:
1. Title Tag Pixel Width: Keep titles between 480px and 600px (50-60 characters) to prevent awkward mid-word truncation.
2. Meta Description Depth: Aim for 140–160 characters (up to 960px). Include your target keyword and a strong Call-To-Action (CTA).
3. Search Intent Matching: Front-load your main keyword within the first 3 words of your title tag for maximum SEO relevance.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
