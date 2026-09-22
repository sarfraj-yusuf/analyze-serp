'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, Lock, FileSearch, Eye } from 'lucide-react';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';

interface TechnicalHygieneCardProps {
  technicalHygiene: {
    isCrawlable: boolean;
    isIndexable: boolean;
    hasHttps: boolean;
    hasCanonicalMatch: boolean;
    issues: string[];
  };
}

export const TechnicalHygieneCard: React.FC<TechnicalHygieneCardProps> = ({ technicalHygiene }) => {
  const { isCrawlable, isIndexable, hasHttps, hasCanonicalMatch, issues } = technicalHygiene;
  const isHealthy = isCrawlable && isIndexable && hasHttps && hasCanonicalMatch;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-white/10 shadow-sm space-y-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              Foundation Check
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            Critical Technical Hygiene & Crawlability
            <SEOExplanationTooltip text="Verifies that your target page can be fetched, crawled, and indexed by search engine bots without security or canonical blocks." />
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Ensuring Googlebot can crawl and render your page before optimizing content depth.
          </p>
        </div>

        <div className="shrink-0">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              isHealthy
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/50 font-bold'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/50 font-bold'
            }`}
          >
            {isHealthy ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            <span>{isHealthy ? 'Foundation Pass' : 'Action Required'}</span>
          </span>
        </div>
      </div>

      {/* Grid Status Checks (2x2 layout in balanced deck) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {/* 1. Crawlability */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
            isCrawlable
              ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/40'
              : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/40'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Page Crawlability
              </span>
              {isCrawlable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div className={`text-xs font-bold ${isCrawlable ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
              {isCrawlable ? 'Crawlable (HTTP 200)' : 'Unreachable / Empty'}
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
              {isCrawlable ? 'Server returned valid HTML content.' : 'Bots cannot fetch HTML text.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 text-[11px] leading-snug">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Business Impact:</span>{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {isCrawlable
                ? 'Search bots can parse your content without technical blockage.'
                : 'Googlebot cannot crawl — 0 pages can rank or generate revenue.'}
            </span>
          </div>
        </div>

        {/* 2. Indexability */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
            isIndexable
              ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/40'
              : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/40'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Indexability Status
              </span>
              {isIndexable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div className={`text-xs font-bold ${isIndexable ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
              {isIndexable ? 'Indexable Allowed' : 'Blocked / Noindex'}
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
              {isIndexable ? 'Robots.txt & meta tags allow indexing.' : 'Robots rule prohibits indexing.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 text-[11px] leading-snug">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Business Impact:</span>{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {isIndexable
                ? 'Page is eligible to appear in search and capture user queries.'
                : '"noindex" commands Google to hide this page from search results.'}
            </span>
          </div>
        </div>

        {/* 3. HTTPS Security */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
            hasHttps
              ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/40'
              : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-900/40'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> SSL Encryption
              </span>
              {hasHttps ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div className={`text-xs font-bold ${hasHttps ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
              {hasHttps ? 'Secure HTTPS' : 'Insecure HTTP'}
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
              {hasHttps ? 'Valid SSL protocol active.' : 'Missing SSL encryption.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 text-[11px] leading-snug">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Business Impact:</span>{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {hasHttps
                ? 'Safeguards user trust and passes Google’s core HTTPS ranking check.'
                : 'Browsers show "Not Secure" warning, causing up to 85% visitor bounce.'}
            </span>
          </div>
        </div>

        {/* 4. Canonical Tag Match */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
            hasCanonicalMatch
              ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-900/40'
              : 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-900/40'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Canonical Tag Match
              </span>
              {hasCanonicalMatch ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className={`text-xs font-bold ${hasCanonicalMatch ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {hasCanonicalMatch ? 'Self-Referencing / Valid' : 'Domain Mismatch'}
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
              {hasCanonicalMatch ? 'Canonical URL aligns with target domain.' : 'Canonical points elsewhere.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 text-[11px] leading-snug">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Business Impact:</span>{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {hasCanonicalMatch
                ? 'Consolidates ranking authority directly into this target URL.'
                : 'Dilutes SEO equity across duplicate URLs or transfers to external site.'}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Issues Banner if Any */}
      {issues.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-300 space-y-1">
          <span className="font-extrabold flex items-center gap-1.5 text-red-700 dark:text-red-400">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            Critical Technical Hygiene Warnings:
          </span>
          <ul className="list-disc list-inside space-y-0.5 pt-1 font-mono text-[11px]">
            {issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
