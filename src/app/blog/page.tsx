import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getPaginatedBlogPosts, getAllBlogCategories } from '@/lib/blog';
import { Sparkles, Search, BookOpen, Clock, Calendar, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEO Knowledge Base & Actionable Guides | AnalyzeSERP Blog',
  description:
    'Learn how to perform competitor keyword gap analysis, optimize title tag pixel lengths, audit affiliate links, and boost organic search rankings with guides by Sarfraj Yusuf.',
  openGraph: {
    title: 'SEO Knowledge Base & Actionable Guides | AnalyzeSERP Blog',
    description:
      'Competitor SEO audit guides, keyword gap strategies, and technical performance tutorials.',
    url: 'https://analyzeserp.com/blog',
    type: 'website',
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const currentCategory = params.category || 'All';
  const searchQuery = params.search || '';

  const { posts, totalPages, totalPosts } = getPaginatedBlogPosts(currentPage, 9);
  const categories = ['All', ...getAllBlogCategories()];

  // Filter posts based on category and search query
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = currentCategory === 'All' || post.category === currentCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEO Knowledge Base & Strategy Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Actionable SEO Guides & <br />
            <span className="gradient-text">Competitor Growth Tactics</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Deep-dive tutorials on competitor gap analysis, title tag pixel engineering, link audit compliance, and content readability by <strong>Sarfraj Yusuf</strong>.
          </p>
        </div>

        {/* Featured Hero Article */}
        {featuredPost && currentPage === 1 && !searchQuery && currentCategory === 'All' && (
          <div className="glass-panel rounded-3xl border border-emerald-500/40 p-6 sm:p-8 bg-gradient-to-r from-slate-900/5 via-slate-900/0 to-emerald-500/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider text-[10px]">
                    Featured Article
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredPost.readingTimeMinutes} min read
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  <Link href={`/blog/${featuredPost.slug}`} className="hover:text-emerald-500 transition-colors">
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                  {featuredPost.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">
                      SY
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{featuredPost.author}</span>
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-400">{featuredPost.date}</div>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-1/2 h-64 sm:h-72 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative shadow-lg group shrink-0">
                {featuredPost.image ? (
                  <Link href={`/blog/${featuredPost.slug}`} className="block w-full h-full">
                    <img
                      src={
                        featuredPost.image.startsWith('/')
                          ? featuredPost.image
                          : `/${featuredPost.image.replace(/^blogs\//, 'blog/')}`
                      }
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 flex items-center justify-center p-6 text-center">
                    <div className="space-y-2">
                      <BookOpen className="w-12 h-12 text-emerald-400 mx-auto" />
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Competitor SEO Intelligence</div>
                      <div className="text-xs text-slate-500 dark:text-gray-400">Step-by-step optimization walkthrough</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === 'All' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  currentCategory === cat
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider text-[9px]">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" /> {post.readingTimeMinutes} min
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-500 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center font-bold text-[10px]">
                    SY
                  </div>
                  <span className="text-slate-600 dark:text-gray-400 text-[11px]">{post.author}</span>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* URL-Based Pagination Controls (/blog?page=2) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}&category=${encodeURIComponent(currentCategory)}`}
                className="px-4 py-2 rounded-xl glass-panel border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center gap-1 hover:border-emerald-500 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Link>
            )}

            <div className="px-4 py-2 rounded-xl glass-panel border border-slate-200 dark:border-white/10 text-xs font-mono font-bold">
              Page {currentPage} of {totalPages}
            </div>

            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}&category=${encodeURIComponent(currentCategory)}`}
                className="px-4 py-2 rounded-xl glass-panel border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center gap-1 hover:border-emerald-500 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
