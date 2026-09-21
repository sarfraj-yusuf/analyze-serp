'use client';

import React, { useState, useEffect } from 'react';
import { TOCItem } from '@/lib/blog';
import { ListOrdered, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';

interface BlogTableOfContentsProps {
  toc: TOCItem[];
  variant?: 'desktop-sticky' | 'mobile-drawer';
}

export const BlogTableOfContents: React.FC<BlogTableOfContentsProps> = ({
  toc,
  variant = 'desktop-sticky',
}) => {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id || '');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    const handleScroll = () => {
      // 140px offset below sticky header/navbar
      const scrollPosition = window.scrollY + 140;

      let currentId = toc[0]?.id || '';
      for (let i = 0; i < toc.length; i++) {
        const el = document.getElementById(toc[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPosition) {
            currentId = toc[i].id;
          } else {
            break;
          }
        }
      }

      if (currentId) {
        setActiveId(currentId);
      }
    };

    handleScroll();

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  if (!toc || toc.length === 0) return null;

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // Mobile Accordion Drawer (shown above article on small screens)
  if (variant === 'mobile-drawer') {
    return (
      <div className="lg:hidden rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 p-4 shadow-xs not-prose my-6">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-100 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ListOrdered className="size-3.5" />
            </div>
            <span>Table of Contents ({toc.length} sections)</span>
          </div>
          <div className="text-slate-400">
            {isMobileOpen ? (
              <ChevronUp className="size-4 text-emerald-500" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </div>
        </button>

        {isMobileOpen && (
          <nav className="pt-3 mt-3 border-t border-slate-200/80 dark:border-white/10 space-y-1 text-xs max-h-72 overflow-y-auto">
            {toc.map((item, index) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    scrollToHeading(item.id, e);
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-start gap-2 py-2 px-3 rounded-lg transition-colors text-xs leading-relaxed ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0 font-medium tabular-nums">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <span>{item.text}</span>
                </a>
              );
            })}
          </nav>
        )}
      </div>
    );
  }

  // Calculate reading progress across chapters
  const activeIndex = Math.max(0, toc.findIndex((item) => item.id === activeId));
  const progressPercent = Math.min(100, Math.round(((activeIndex + 1) / toc.length) * 100));

  // Desktop Sticky Sidebar
  return (
    <div className="w-full space-y-3 not-prose">
      <div className="space-y-1.5 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Bookmark className="size-3.5 text-emerald-500" />
            <span>Table of Contents</span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {progressPercent}% read
          </span>
        </div>
        {/* Subtle Progress Bar */}
        <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <nav
        aria-label="Table of Contents"
        className="space-y-1 text-xs sm:text-[13px] pr-1 max-h-[calc(100vh-16rem)] overflow-y-auto modal-scroll"
      >
        {toc.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToHeading(item.id, e)}
              className={`group flex items-start gap-3 py-2 px-3 rounded-xl transition-colors leading-relaxed ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border-l-2 border-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <span
                className={`font-mono text-[11px] sm:text-xs shrink-0 tabular-nums transition-colors mt-0.5 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-pretty">{item.text}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};
