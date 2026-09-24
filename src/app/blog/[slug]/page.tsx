import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthorBio } from '@/components/AuthorBio';
import { ToolCTAWidget } from '@/components/ToolCTAWidget';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { BlogTableOfContents } from '@/components/BlogTableOfContents';
import { BlogShareDock } from '@/components/BlogShareDock';
import { RelatedBlogPosts } from '@/components/RelatedBlogPosts';
import { BlogCallout } from '@/components/BlogCallout';
import { BlogCodeBlock } from '@/components/BlogCodeBlock';
import { ArticleFeedback } from '@/components/ArticleFeedback';
import { BlogArticleNavigation } from '@/components/BlogArticleNavigation';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Search,
  Hash,
  CheckCircle2,
} from 'lucide-react';

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: SingleBlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const { meta } = post;
  const canonicalUrl = `https://analyzeserp.com/blog/${slug}`;

  return {
    title: meta.title,
    description: meta.description,
    authors: [{ name: meta.author, url: meta.authorTwitter }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: meta.date,
      authors: [meta.author],
      images: [{ url: meta.image || '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.image || '/og-image.jpg'],
    },
  };
}

export default async function SingleBlogPostPage({ params }: SingleBlogPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { meta, content, toc } = post;
  const allPosts = getAllBlogPosts();

  // Find previous and next articles for bottom navigation
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // Sanitize MDX content: if content begins with the hero image, strip it to prevent duplicate hero images
  let sanitizedContent = content;
  if (meta.image) {
    sanitizedContent = sanitizedContent.replace(
      /^\s*!\[[^\]]*\]\([^)]+\)\s*(?:\r?\n\s*_[^_]+_\s*)?/i,
      ''
    );
  }

  // Google E-E-A-T Person & BlogPosting Schema
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    image: `https://analyzeserp.com${meta.image}`,
    datePublished: meta.date,
    dateModified: meta.date,
    author: {
      '@type': 'Person',
      name: meta.author,
      jobTitle: meta.authorRole,
      url: 'https://analyzeserp.com/about',
      sameAs: [meta.authorTwitter, meta.authorLinkedin].filter(Boolean),
    },
    publisher: {
      '@type': 'Organization',
      name: 'AnalyzeSERP',
      url: 'https://analyzeserp.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://analyzeserp.com/og-image.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://analyzeserp.com/blog/${slug}`,
    },
  };

  const mdxComponents = {
    ToolCTAWidget,
    BlogCallout,
    Callout: BlogCallout,
    Tip: (props: any) => <BlogCallout type="tip" {...props} />,
    Warning: (props: any) => <BlogCallout type="warning" {...props} />,
    Takeaway: (props: any) => <BlogCallout type="takeaway" {...props} />,
    Note: (props: any) => <BlogCallout type="note" {...props} />,
    h1: (props: any) => (
      <h1
        className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 tracking-tight border-b border-slate-200/80 dark:border-white/10 pb-3 text-balance"
        {...props}
      />
    ),
    h2: (props: any) => {
      const id = props.id || '';
      return (
        <h2
          className="group text-2xl sm:text-[1.75rem] font-bold text-slate-900 dark:text-slate-100 mt-14 mb-4 tracking-tight scroll-mt-28 pb-3 border-b border-slate-200/80 dark:border-white/10 text-balance flex items-center justify-between"
          {...props}
        >
          <span>{props.children}</span>
          {id && (
            <a
              href={`#${id}`}
              aria-label="Direct section link"
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs shrink-0 ml-2"
              title="Direct section link"
            >
              <Hash className="size-4" />
            </a>
          )}
        </h2>
      );
    },
    h3: (props: any) => {
      const id = props.id || '';
      return (
        <h3
          className="group text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-3 tracking-tight scroll-mt-28 text-balance flex items-center justify-between"
          {...props}
        >
          <span>{props.children}</span>
          {id && (
            <a
              href={`#${id}`}
              aria-label="Direct section link"
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs shrink-0 ml-2"
              title="Direct section link"
            >
              <Hash className="size-3.5" />
            </a>
          )}
        </h3>
      );
    },
    p: (props: any) => (
      <p
        className="text-[17px] sm:text-[18px] text-slate-700 dark:text-slate-300 leading-[1.8] mb-6 font-normal text-pretty"
        {...props}
      />
    ),
    ul: (props: any) => (
      <ul
        className="my-6 space-y-2.5 list-disc list-outside pl-6 text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-300 marker:text-emerald-500 font-normal leading-relaxed text-pretty"
        {...props}
      />
    ),
    ol: (props: any) => (
      <ol
        className="my-6 space-y-2.5 list-decimal list-outside pl-6 text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-300 marker:text-slate-500 dark:marker:text-slate-400 font-normal leading-relaxed text-pretty"
        {...props}
      />
    ),
    li: (props: any) => (
      <li className="pl-1 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />
    ),
    blockquote: (props: any) => (
      <blockquote
        className="my-8 pl-5 sm:pl-6 py-3 border-l-4 border-emerald-500 bg-emerald-500/[0.03] rounded-r-2xl text-[17px] sm:text-[18px] text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed not-prose"
        {...props}
      />
    ),
    pre: (props: any) => <BlogCodeBlock {...props} />,
    code: (props: any) => {
      if (!props.className) {
        return (
          <code
            className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs sm:text-[13px] border border-slate-200/80 dark:border-white/10"
            {...props}
          />
        );
      }
      return <code {...props} />;
    },
    table: (props: any) => (
      <div className="my-8 overflow-x-auto rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-xs not-prose">
        <table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} />
      </div>
    ),
    thead: (props: any) => (
      <thead
        className="bg-slate-100 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold uppercase text-[11px] tracking-wider"
        {...props}
      />
    ),
    tbody: (props: any) => (
      <tbody
        className="divide-y divide-slate-200/80 dark:divide-white/10 text-slate-700 dark:text-slate-300"
        {...props}
      />
    ),
    tr: (props: any) => (
      <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors" {...props} />
    ),
    th: (props: any) => (
      <th className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100 shrink-0" {...props} />
    ),
    td: (props: any) => (
      <td className="px-5 py-3.5 leading-relaxed font-normal" {...props} />
    ),
    img: (props: any) => {
      let src = props.src || '';
      if (src.startsWith('./images/')) {
        src = src.replace('./images/', '/blog/images/');
      } else if (src.startsWith('images/')) {
        src = src.replace('images/', '/blog/images/');
      } else if (src.startsWith('blogs/images/')) {
        src = src.replace('blogs/images/', '/blog/images/');
      }
      return (
        <figure className="my-8 space-y-2">
          <img
            {...props}
            src={src}
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm max-w-full h-auto mx-auto"
            loading="lazy"
          />
          {props.alt && (
            <figcaption className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
              {props.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      {/* Viewport Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <Navbar />

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Navigation Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600" />
          <Link
            href="/blog"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Blog
          </Link>
          <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600" />
          <Link
            href={`/blog?category=${encodeURIComponent(meta.category)}`}
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {meta.category}
          </Link>
          <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600 hidden sm:inline" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-sm hidden sm:inline">
            {meta.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-6 max-w-5xl">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <Link
              href={`/blog?category=${encodeURIComponent(meta.category)}`}
              className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider text-[10px] hover:bg-emerald-500/20 transition-colors"
            >
              {meta.category}
            </Link>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Clock className="size-3.5 text-emerald-500" />
              <span>{meta.readingTimeMinutes} min read</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Calendar className="size-3.5" />
              <span>Published {meta.date}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>2026 Strategy</span>
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.18] text-balance max-w-4xl">
            {meta.title}
          </h1>

          {/* Article Summary Lead */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-pretty max-w-3xl">
            {meta.description}
          </p>

          {/* Author Block & 1-Click Social Sharing Dock */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shadow-xs">
                SY
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{meta.author}</span>
                  <span title="Verified Author">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {meta.authorRole}
                </div>
              </div>
            </div>

            {/* Social Share & Copy Link Dock */}
            <BlogShareDock title={meta.title} slug={slug} />
          </div>
        </header>

        {/* Mobile Accordion Drawer Table of Contents */}
        <BlogTableOfContents toc={toc} variant="mobile-drawer" />

        {/* Dual-Column Desktop Content Section: CSS Grid guarantees equal column heights so sticky runway works 100% reliably */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-12 xl:gap-16">
          {/* Main Reading Column (Calibrated 68-72 char prose, up to 840px) */}
          <div className="w-full min-w-0 max-w-full">
            {/* Featured Editorial Cover Image: Proportional to reading column, flanked by sidebar with zero empty space */}
            {meta.image && (
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-slate-900 mb-8 aspect-[16/9] sm:aspect-[21/10] max-h-[360px]">
                <img
                  src={meta.image}
                  alt={meta.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <article className="text-slate-800 dark:text-slate-200">
              <MDXRemote
                source={sanitizedContent}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
                  },
                }}
              />
            </article>

            {/* Reader Sentiment & Feedback Widget */}
            <ArticleFeedback slug={slug} />

            {/* Article End Social Share Reminder */}
            <div className="my-8 p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Did you find this guide actionable?
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Share it with fellow SEOs or bookmark it for your next audit.
                </p>
              </div>
              <BlogShareDock title={meta.title} slug={slug} />
            </div>

            {/* Previous & Next Article Navigation Cards */}
            <BlogArticleNavigation prevPost={prevPost} nextPost={nextPost} />

            {/* E-E-A-T Author Bio Card */}
            <AuthorBio
              author={meta.author}
              role={meta.authorRole}
              twitter={meta.authorTwitter}
              linkedin={meta.authorLinkedin}
            />
          </div>

          {/* Desktop Sidebar: Grid column stretches to full article height, allowing inner sticky TOC to pin */}
          <aside className="hidden lg:block w-full">
            {/* Compact Tool Conversion Mini-Card (Scrolls naturally with content) */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 shadow-xs mb-6">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Sparkles className="size-3.5 text-emerald-500" />
                <span>Free Audit Engine</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                Put This Guide Into Practice On Your Site
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-pretty">
                Run a multi-URL competitor comparison in 30 seconds. Zero signup needed.
              </p>
              <Link
                href="/#hero-audit-dock"
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-xs active:scale-95"
              >
                <span>Launch Competitor Audit</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Desktop Sticky Table of Contents (Sticks smoothly to top-28 as user reads) */}
            <div className="sticky top-28 z-20 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs">
              <BlogTableOfContents toc={toc} variant="desktop-sticky" />
            </div>
          </aside>
        </div>

        {/* Related Blog Posts / Next Up */}
        <RelatedBlogPosts
          currentSlug={slug}
          currentCategory={meta.category}
          allPosts={allPosts}
        />
      </main>

      <Footer />
    </div>
  );
}
