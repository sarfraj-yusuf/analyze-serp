import React from 'react';
import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BlogArticleNavigationProps {
  prevPost?: BlogPostMeta | null;
  nextPost?: BlogPostMeta | null;
}

export const BlogArticleNavigation: React.FC<BlogArticleNavigationProps> = ({
  prevPost,
  nextPost,
}) => {
  if (!prevPost && !nextPost) return null;

  return (
    <nav
      aria-label="Previous and Next Articles"
      className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose"
    >
      {/* Previous Article Card */}
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="group flex flex-col justify-between p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all shadow-xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Previous Guide</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {prevPost.title}
          </h4>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{prevPost.category}</span>
            <span>•</span>
            <span>{prevPost.readingTimeMinutes} min</span>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Article Card */}
      {nextPost && (
        <Link
          href={`/blog/${nextPost.slug}`}
          className="group flex flex-col justify-between p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all shadow-xs text-right sm:text-right"
        >
          <div className="flex items-center justify-end gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <span>Next Guide</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {nextPost.title}
          </h4>
          <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{nextPost.category}</span>
            <span>•</span>
            <span>{nextPost.readingTimeMinutes} min</span>
          </div>
        </Link>
      )}
    </nav>
  );
};
