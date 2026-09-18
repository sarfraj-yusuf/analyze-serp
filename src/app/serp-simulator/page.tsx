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

  const serpGuide = {
    tag: 'METADATA & SERP CRAFT',
    title: 'Search Snippets vs. Social Cards: Optimizing for Maximum Click-Through',
    intro:
      'Search engine snippets and social link previews serve as your digital storefront. Optimizing visual metadata ensures your links command high engagement and zero awkward truncation across Google, Twitter/X, Facebook, and LinkedIn.',
    items: [
      {
        title: 'Title Tag Pixel Budgeting',
        description:
          'Google truncates titles at approximately 600 pixels on desktop. Keeping important primary keywords in the first 50–55 characters avoids ellipses and keeps brand context intact.',
      },
      {
        title: 'Open Graph Aspect Ratio & Framing',
        description:
          'Maintain an exact 1.91:1 ratio (1200 x 630 pixels) with a safe center zone. This prevents crucial headings or logos from being cropped by mobile social feeds.',
      },
      {
        title: 'Twitter / X Card Hierarchy',
        description:
          'Always declare twitter:card="summary_large_image" for editorial and landing pages to ensure your link renders as an expansive visual showcase rather than a cramped square thumbnail.',
      },
      {
        title: 'Canonical URL & Favicon Integrity',
        description:
          'Search engines and modern feed algorithms rely on canonical tags to group social engagement signals. High-contrast 32x32 favicons enhance instant brand recall in mobile search carousels.',
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audit Suite</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium">SERP Simulator</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Visual SERP & Social Card Preview Tool</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Google SERP & Social Card Preview Tool
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Test how your title tags, meta descriptions, and Open Graph social share cards appear on Google Search, Facebook, Twitter/X, and LinkedIn before publishing.
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
          guideSection={serpGuide}
        />
      </main>

      <Footer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
