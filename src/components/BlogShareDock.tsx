'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, Twitter, Linkedin, ExternalLink } from 'lucide-react';

interface BlogShareDockProps {
  title: string;
  slug: string;
}

export const BlogShareDock: React.FC<BlogShareDockProps> = ({ title, slug }) => {
  const [copied, setCopied] = useState(false);

  const getArticleUrl = () => {
    if (typeof window !== 'undefined' && window.location.href) {
      return window.location.href;
    }
    return `https://analyzeserp.com/blog/${slug}`;
  };

  const handleCopyLink = () => {
    const url = getArticleUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = getArticleUrl();
    const text = encodeURIComponent(`"${title}" — In-depth SEO guide by @sarfrajyusuf:\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = getArticleUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: getArticleUrl(),
        });
      } catch (err) {
        // user dismissed share or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 not-prose">
      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
        Share Guide:
      </span>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
        title="Copy article link to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied Link!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Share on X / Twitter */}
      <button
        type="button"
        onClick={handleShareTwitter}
        className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
        title="Share to X (Twitter)"
        aria-label="Share to X (Twitter)"
      >
        <Twitter className="w-3.5 h-3.5 text-sky-500" />
        <span className="hidden sm:inline font-semibold">Post</span>
      </button>

      {/* Share on LinkedIn */}
      <button
        type="button"
        onClick={handleShareLinkedIn}
        className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
        title="Share to LinkedIn"
        aria-label="Share to LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline font-semibold">Share</span>
      </button>

      {/* Mobile Native Share */}
      <button
        type="button"
        onClick={handleNativeShare}
        className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs sm:hidden flex items-center transition-all cursor-pointer shadow-xs active:scale-95"
        title="More sharing options"
        aria-label="More sharing options"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
