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
import { TableOfContents } from '@/components/TableOfContents';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog';
import { ArrowLeft, Clock, Calendar, Share2, Sparkles } from 'lucide-react';

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
    return { title: 'Post Not Found | AnalyzeSERP' };
  }

  const { meta } = post;
  const canonicalUrl = `https://analyzeserp.com/blog/${slug}`;

  return {
    title: `${meta.title} | AnalyzeSERP Blog`,
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
    h1: (props: any) => (
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-10 mb-5 tracking-tight border-b border-slate-200 dark:border-white/10 pb-3" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-10 mb-4 tracking-tight border-l-4 border-emerald-500 pl-4 py-1.5 bg-emerald-500/5 rounded-r-xl shadow-sm" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-8 mb-3" {...props} />
    ),
    p: (props: any) => (
      <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed sm:leading-8 mb-6 font-normal" {...props} />
    ),
    ul: (props: any) => (
      <ul className="space-y-3.5 my-6 pl-1" {...props} />
    ),
    ol: (props: any) => (
      <ol className="space-y-3.5 my-6 pl-6 list-decimal text-sm sm:text-base text-slate-700 dark:text-gray-300 font-medium" {...props} />
    ),
    li: (props: any) => (
      <li className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0 shadow-sm shadow-emerald-500/50" />
        <span className="flex-1">{props.children}</span>
      </li>
    ),
    blockquote: (props: any) => (
      <blockquote className="my-8 p-5 sm:p-6 rounded-2xl glass-panel border-l-4 border-emerald-500 bg-emerald-500/5 text-slate-800 dark:text-gray-200 font-medium italic shadow-sm leading-relaxed" {...props} />
    ),
    hr: () => (
      <hr className="my-10 border-t-2 border-dashed border-slate-200 dark:border-white/10" />
    ),
    strong: (props: any) => (
      <strong className="font-extrabold text-slate-900 dark:text-white" {...props} />
    ),
    a: (props: any) => (
      <a className="text-emerald-600 dark:text-emerald-400 underline font-bold hover:text-emerald-500 transition-colors" {...props} />
    ),
    code: (props: any) => (
      <code className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-slate-300 dark:border-white/10" {...props} />
    ),
    table: (props: any) => (
      <div className="my-8 overflow-x-auto rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl">
        <table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} />
      </div>
    ),
    thead: (props: any) => (
      <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-extrabold uppercase text-[11px] tracking-wider" {...props} />
    ),
    tbody: (props: any) => (
      <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-700 dark:text-gray-300" {...props} />
    ),
    tr: (props: any) => (
      <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors" {...props} />
    ),
    th: (props: any) => (
      <th className="px-5 py-4 font-extrabold text-slate-900 dark:text-white shrink-0" {...props} />
    ),
    td: (props: any) => (
      <td className="px-5 py-4 leading-relaxed font-normal" {...props} />
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
        <img
          {...props}
          src={src}
          className="my-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl max-w-full h-auto mx-auto"
          loading="lazy"
        />
      );
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      {/* E-E-A-T Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/blog"
            className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog Knowledge Base
          </Link>
          <span className="text-slate-400 dark:text-gray-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs">{meta.title}</span>
        </div>

        {/* Header Metadata */}
        <div className="space-y-4 border-b border-slate-200 dark:border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider text-[10px]">
              {meta.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {meta.readingTimeMinutes} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" /> {meta.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {meta.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
            {meta.description}
          </p>
        </div>

        {/* Auto-Generated Table of Contents */}
        <TableOfContents toc={toc} />

        {/* Blog Post Content Body */}
        <article className="max-w-none text-slate-900 dark:text-gray-100">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
              },
            }}
          />
        </article>

        {/* E-E-A-T Author Bio Card */}
        <AuthorBio
          author={meta.author}
          role={meta.authorRole}
          twitter={meta.authorTwitter}
          linkedin={meta.authorLinkedin}
        />
      </main>

      <Footer />
    </div>
  );
}
