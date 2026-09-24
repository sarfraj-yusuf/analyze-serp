import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BlogExplorer } from '@/components/BlogExplorer';
import { getAllBlogPosts, getAllBlogCategories } from '@/lib/blog';
import { Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEO Knowledge Base & Actionable Guides',
  description:
    'Learn how to perform competitor keyword gap analysis, optimize title tag pixel lengths, audit affiliate links, and boost organic search rankings with guides by Sarfraj Yusuf.',
  alternates: {
    canonical: 'https://analyzeserp.com/blog',
  },
  openGraph: {
    title: 'SEO Knowledge Base & Actionable Guides | AnalyzeSERP',
    description:
      'Competitor SEO audit guides, keyword gap strategies, and technical performance tutorials.',
    url: 'https://analyzeserp.com/blog',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP SEO Knowledge Base & Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Knowledge Base & Actionable Guides | AnalyzeSERP',
    description:
      'Competitor SEO audit guides, keyword gap strategies, and technical performance tutorials.',
    images: ['/og-image.jpg'],
  },
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || 'All';
  const searchQuery = params.search || '';

  const allPosts = getAllBlogPosts();
  const rawCategories = getAllBlogCategories();
  const categories = ['All', ...rawCategories.filter(Boolean)];

  // Structured Data (JSON-LD) for CollectionPage / Knowledge Base
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AnalyzeSERP SEO Knowledge Base & Actionable Guides',
    description:
      'In-depth competitor analysis playbooks, keyword gap frameworks, and technical SEO tutorials by Sarfraj Yusuf.',
    url: 'https://analyzeserp.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'AnalyzeSERP',
      url: 'https://analyzeserp.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://analyzeserp.com/og-image.jpg',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: allPosts.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://analyzeserp.com/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* Header Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>SEO Knowledge Base · Engineering Playbooks</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Actionable SEO Guides &amp; <br className="hidden sm:inline" />
            Competitor Growth Tactics
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Empirical, data-driven playbooks on competitor keyword gap analysis, title tag pixel engineering, link audit compliance, and Core Web Vitals optimization by <strong className="text-slate-800 dark:text-slate-200">Sarfraj Yusuf</strong>.
          </p>
        </section>

        {/* Interactive Discovery & Feed Engine */}
        <BlogExplorer
          initialPosts={allPosts}
          categories={categories}
          initialCategory={currentCategory}
          initialSearch={searchQuery}
        />
      </main>

      <Footer />
    </div>
  );
}
