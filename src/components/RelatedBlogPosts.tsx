import React from 'react';
import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';
import { ArrowRight, BookOpen, Clock, Calendar } from 'lucide-react';

interface RelatedBlogPostsProps {
  currentSlug: string;
  currentCategory: string;
  allPosts: BlogPostMeta[];
}

export const RelatedBlogPosts: React.FC<RelatedBlogPostsProps> = ({
  currentSlug,
  currentCategory,
  allPosts,
}) => {
  // Filter out the active post
  const otherPosts = allPosts.filter((p) => p.slug !== currentSlug);
  if (otherPosts.length === 0) return null;

  // Prioritize matching category, then others
  const relatedPosts = [...otherPosts]
    .sort((a, b) => {
      const aMatch = a.category === currentCategory ? 1 : 0;
      const bMatch = b.category === currentCategory ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 2);

  return (
    <section aria-label="Related SEO Guides" className="not-prose pt-10 border-t border-slate-200/80 dark:border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Continue Reading
          </span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Recommended SEO Deep Dives
          </h3>
        </div>

        <Link
          href="/blog"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Guides</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => (
          <article
            key={post.slug}
            className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 overflow-hidden group shadow-xs hover:shadow-lg transition-all flex flex-col justify-between bg-white dark:bg-slate-900/60"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              <Link href={`/blog/${post.slug}`} className="block w-full h-full">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <BookOpen className="size-8 text-emerald-500/40" />
                  </div>
                )}
              </Link>
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-white/10">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
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

                <h4 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  By {post.author}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
