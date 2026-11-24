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
    <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs space-y-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
        <div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
            Foundation Check
          </span>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <span>Critical Technical Hygiene &amp; Crawlability</span>
            <SEOExplanationTooltip text="Verifies that your target page can be fetched, crawled, and indexed by search engine bots without security or canonical blocks." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ensuring Googlebot can crawl and render your page before optimizing content depth.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 ${
              isHealthy
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-medium'
            }`}
          >
            {isHealthy ? <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" /> : <AlertOctagon className="size-3.5 text-rose-600 dark:text-rose-400" />}
            <span>{isHealthy ? 'Foundation Pass' : 'Action Required'}</span>
          </span>
        </div>
      </div>

      {/* Grid Status Checks - Lightweight, Flat Layout without heavy nested box borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {/* 1. Crawlability */}
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between space-y-1.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileSearch className="size-3.5 text-slate-400" /> Page Crawlability
              </span>
              {isCrawlable ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertOctagon className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
            </div>
            <div className={`text-xs font-medium ${isCrawlable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isCrawlable ? 'HTTP 200 OK' : 'Unreachable / Blocked'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isCrawlable
                ? 'Server returns valid HTML. Search bots can crawl without technical blockage.'
                : 'Server unreachable or returned an empty response. Bots cannot crawl.'}
            </p>
          </div>
        </div>

        {/* 2. Indexability */}
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between space-y-1.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Eye className="size-3.5 text-slate-400" /> Indexability Status
              </span>
              {isIndexable ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertOctagon className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
            </div>
            <div className={`text-xs font-medium ${isIndexable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isIndexable ? 'Indexable Allowed' : 'Blocked (noindex)'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isIndexable
                ? 'Robots directives permit indexing in search results.'
                : 'Page is tagged with "noindex" or blocked by robots.txt rules.'}
            </p>
          </div>
        </div>

        {/* 3. HTTPS Security */}
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between space-y-1.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="size-3.5 text-slate-400" /> SSL Encryption
              </span>
              {hasHttps ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertOctagon className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
            </div>
            <div className={`text-xs font-medium ${hasHttps ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {hasHttps ? 'HTTPS Active' : 'Insecure HTTP'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {hasHttps
                ? 'Valid SSL certificate active. Meets Google HTTPS ranking requirement.'
                : 'Missing SSL. Browsers show warning, increasing visitor bounce rates.'}
            </p>
          </div>
        </div>

        {/* 4. Canonical Tag Match */}
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between space-y-1.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-slate-400" /> Canonical Tag
              </span>
              {hasCanonicalMatch ? (
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertOctagon className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
            </div>
            <div className={`text-xs font-medium ${hasCanonicalMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {hasCanonicalMatch ? 'Canonical Aligned' : 'Domain Mismatch'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {hasCanonicalMatch
                ? 'Canonical URL matches target domain, consolidating ranking signals.'
                : 'Canonical URL points to a different domain or path, diluting equity.'}
            </p>
          </div>
        </div>
      </div>

      {/* Critical Issues Banner if Any */}
      {issues.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400 space-y-1">
          <span className="font-semibold flex items-center gap-1.5">
            <AlertOctagon className="size-3.5 shrink-0" />
            Critical Technical Hygiene Warnings:
          </span>
          <ul className="list-disc list-inside space-y-0.5 pt-0.5 font-mono text-[11px]">
            {issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
