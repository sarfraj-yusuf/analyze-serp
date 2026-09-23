'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Wrench, Clock, ArrowRight, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { MaintenanceConfig, AnnouncementBannerConfig } from '@/lib/db';

interface PublicSiteConfig {
  maintenance: MaintenanceConfig;
  announcement: AnnouncementBannerConfig;
}

export function LiveAnnouncementBanner() {
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [isDismissed, setIsDismissed] = useState(true); // default true to avoid flash before check

  useEffect(() => {
    let isMounted = true;

    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          setConfig(json.data);

          // Check if current announcement is dismissed
          if (json.data.announcement?.enabled) {
            const cacheKey = `announcement_dismissed_${encodeURIComponent(
              (json.data.announcement.badge || '') + '_' + (json.data.announcement.text || '')
            )}`;
            const dismissed = localStorage.getItem(cacheKey) === 'true';
            setIsDismissed(dismissed);
          }
        }
      } catch (err) {
        // Silently ignore to not disrupt rendering
      }
    }

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!config) return null;

  // 1. Maintenance Mode takes top priority
  if (config.maintenance?.enabled) {
    const isStrict = config.maintenance.level === 'strict_lock';
    return (
      <aside
        role="alert"
        aria-live="assertive"
        className={`w-full py-2.5 px-4 text-xs font-medium border-b transition-colors ${
          isStrict
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
            <div
              className={`p-1 rounded-md shrink-0 ${
                isStrict
                  ? 'bg-rose-200/70 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isStrict ? <AlertTriangle className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 leading-relaxed">
              <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/40 border border-current">
                {config.maintenance.title || 'Platform Notice'}
              </span>
              <span>{config.maintenance.message}</span>
            </div>
          </div>

          {config.maintenance.expectedCompletion && (
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/60 dark:bg-black/30 border border-current">
              <Clock className="w-3 h-3" />
              <span>Est. Completion: {config.maintenance.expectedCompletion}</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 2. Announcement Banner
  if (config.announcement?.enabled && !isDismissed) {
    const { badge, text, linkText, linkUrl, variant, dismissable } = config.announcement;

    const variantStyles = {
      info: {
        banner: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/40 text-sky-950 dark:text-sky-200',
        badge: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border-sky-300/60 dark:border-sky-700/60',
        link: 'text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-white',
        icon: <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />,
      },
      promotion: {
        banner: 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/40 text-indigo-950 dark:text-indigo-200',
        badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/60',
        link: 'text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-white',
        icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
      },
      warning: {
        banner: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/40 text-amber-950 dark:text-amber-200',
        badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60',
        link: 'text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-white',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />,
      },
      success: {
        banner: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200',
        badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
        link: 'text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-white',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      },
    };

    const currentVariant = variantStyles[variant] || variantStyles.info;

    const handleDismiss = () => {
      setIsDismissed(true);
      const cacheKey = `announcement_dismissed_${encodeURIComponent((badge || '') + '_' + (text || ''))}`;
      try {
        localStorage.setItem(cacheKey, 'true');
      } catch (e) {}
    };

    return (
      <aside
        role="region"
        aria-label="Announcement"
        className={`w-full py-2 px-4 text-xs font-medium border-b transition-all duration-200 ${currentVariant.banner}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {currentVariant.icon}
            {badge && (
              <span
                className={`font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${currentVariant.badge}`}
              >
                {badge}
              </span>
            )}
            <p className="truncate text-slate-800 dark:text-slate-200 font-medium">
              {text}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {linkText && linkUrl && (
              <Link
                href={linkUrl}
                className={`inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline transition-colors ${currentVariant.link}`}
              >
                <span>{linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}

            {dismissable && (
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
