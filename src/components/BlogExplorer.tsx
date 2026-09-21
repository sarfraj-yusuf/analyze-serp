'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';
import {
  Search,
  X,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Tag,
  BookOpen,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';

interface BlogExplorerProps {
  initialPosts: BlogPostMeta[];
  categories: string[];
  initialCategory?: string;
  initialSearch?: string;
}

export const BlogExplorer: React.FC<BlogExplorerProps> = ({
  initialPosts,
  categories,
  initialCategory = 'All',
  initialSearch = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state to URL search parameters for bookmarking & sharing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (activeCategory && activeCategory !== 'All') {
      url.searchParams.set('category', activeCategory);
    } else {
      url.searchParams.delete('category');
    }

    if (searchQuery.trim()) {
      url.searchParams.set('search', searchQuery.trim());
    } else {
      url.searchParams.delete('search');
    }

    window.history.replaceState({}, '', url.toString());
  }, [activeCategory, searchQuery]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { All: initialPosts.length };
    initialPosts.forEach((post) => {
      map[post.category] = (map[post.category] || 0) + 1;
    });
    return map;
  }, [initialPosts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        activeCategory === 'All' || post.category === activeCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, activeCategory, searchQuery]);

  // Featured post detection
  const featuredPost = useMemo(() => {
    return initialPosts.find((p) => p.featured) || initialPosts[0];
  }, [initialPosts]);

  // Determine if featured banner should show
  const showFeaturedHero =
    activeCategory === 'All' && !searchQuery.trim() && !!featuredPost;

  // Remaining posts for the grid (excluding featured post when featured hero is active)
  const gridPosts = useMemo(() => {
    if (showFeaturedHero) {
      return filteredPosts.filter((p) => p.slug !== featuredPost.slug);
    }
    return filteredPosts;
  }, [filteredPosts, showFeaturedHero, featuredPost]);

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-12">
      {/* Search & Discovery Toolbar */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, competitor audits, keyword gap strategies..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl glass-input text-xs sm:text-sm font-medium focus:outline-none transition-all shadow-xs border border-slate-200/80 dark:border-white/10 focus:border-emerald-500/60 dark:focus:border-emerald-500/50"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500 pointer-events-none bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5">
                <span>/</span>
              </div>
            )}
          </div>

          {/* Quick Metrics / Counter */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs font-mono text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-100">{filteredPosts.length}</strong> of{' '}
              {initialPosts.length} Guides
            </span>
          </div>
        </div>

        {/* Filter Tabs by Category */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm font-bold active:scale-95'
                    : 'bg-white/70 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 active:scale-95'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Featured Post Hero Card */}
      {showFeaturedHero && (
        <section
          aria-label="Featured Article"
          className="glass-panel rounded-3xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
            {/* Left Content Column */}
            <div className="w-full lg:w-7/12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Featured Deep Dive</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredPost.readingTimeMinutes} min read</span>
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {featuredPost.description}
                </p>

                {/* Topic Tags */}
                {featuredPost.tags && featuredPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredPost.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Author & CTA Footer */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shadow-xs">
                    SY
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{featuredPost.author}</span>
                      <span title="Verified Author">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{featuredPost.authorRole}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {featuredPost.date}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual Image Column */}
            <div className="w-full lg:w-5/12 relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-lg min-h-[240px] sm:min-h-[300px]">
              <Link href={`/blog/${featuredPost.slug}`} className="block w-full h-full">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid Section */}
      {gridPosts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {gridPosts.map((post) => (
              <article
                key={post.slug}
                className="glass-panel rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-xl transition-all bg-white dark:bg-[#0c1220]/60"
              >
                {/* Visual Header Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-slate-900">
                  <Link href={`/blog/${post.slug}`} className="block w-full h-full">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-emerald-500/10 via-slate-900/10 to-teal-500/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-emerald-500/40" />
                      </div>
                    )}
                  </Link>
                  {/* Category Pill Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-xs">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Reading Time & Date */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTimeMinutes} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                        SY
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {post.author}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-bold text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* In-Feed Tool Conversion Bridge */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-slate-900/5 to-teal-500/10 dark:from-emerald-500/10 dark:via-slate-900/40 dark:to-teal-500/10 border border-emerald-500/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Put These Playbooks Into Action</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Audit Your Competitor Pages in 30 Seconds
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Compare keyword gaps, title tag pixel caps, and Core Web Vitals against top-ranking SERP competitors. 100% free, zero login needed.
              </p>
            </div>

            <Link
              href="/#hero-audit-dock"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95 shrink-0"
            >
              <span>Launch Free Audit</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-10 sm:p-16 border border-slate-200/80 dark:border-white/10 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No matching SEO guides found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No articles matched your filter: &quot;{searchQuery || activeCategory}&quot;. Try broadening your keywords or resetting filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
