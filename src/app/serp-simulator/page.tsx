'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SerpSocialSimulator } from '@/components/SerpSocialSimulator';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { SEOContentSection } from '@/components/SEOContentSection';
import { Share2, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SerpSimulatorPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const steps = [
    {
      title: 'Enter Title Tag & Meta Description',
      description: 'Fill in your target title tag, meta description, and target canonical URL.',
    },
    {
      title: 'Upload / Specify OG Image URL',
      description: 'Test Open Graph (og:image) and Twitter Card banner image dimensions.',
    },
    {
      title: 'Toggle Desktop, Mobile & Social Card Previews',
      description: 'Instantly view how your page will display across Google Search, Facebook, Twitter/X, and LinkedIn.',
    },
  ];

  const faqs = [
    {
      question: 'What is an Open Graph (og:image) meta tag?',
      answer: 'Open Graph meta tags control how URLs display when shared on social media platforms like Facebook, LinkedIn, Slack, and Pinterest. The og:image tag specifies the preview image thumbnail.',
    },
    {
      question: 'What is the recommended size for Open Graph social images?',
      answer: 'The recommended aspect ratio for OG images is 1.91:1 with dimensions of 1200 x 630 pixels. Images should stay under 8MB in file size.',
    },
    {
      question: 'Why does Twitter / X require summary_large_image cards?',
      answer: 'The twitter:card tag with value "summary_large_image" forces Twitter to render a full-width high-resolution banner image above the article headline, significantly driving higher click engagement.',
    },
  ];

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
          <span className="text-slate-900 dark:text-white font-bold">SERP & Social Card Simulator</span>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Visual CTR Preview</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Social & SERP <span className="gradient-text">Preview Simulator</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Preview title tags, meta descriptions, Open Graph images (<code className="text-emerald-400 font-mono">og:image</code>), and Twitter Cards (<code className="text-cyan-400 font-mono">twitter:card</code>) across search engines and social platforms.
          </p>
        </div>

        {/* Interactive Live Simulator Component */}
        <SerpSocialSimulator />

        <SEOContentSection
          toolName="SERP & Social Card Simulator"
          title="Maximize Visual CTR on Search Engines and Social Feeds"
          description="Visual appeal on social media feeds and Google SERPs directly drives user traffic to your website."
          steps={steps}
          importanceTitle="Why Open Graph & SERP Visual Previews Drive Traffic"
          importanceContent={`When users share your content on social networks or view your page on Google, visual presentation determines whether they click through.

Key Social & SERP Optimization Standards:
1. High-Res OG Image: Use 1200x630px images with clear text overlays and brand identity.
2. Twitter Card Card Type: Specify twitter:card="summary_large_image" for prominent feed visibility.
3. Pixel Precision: Keep titles under 600px to avoid awkward clipping in social cards.`}
          faqs={faqs}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
