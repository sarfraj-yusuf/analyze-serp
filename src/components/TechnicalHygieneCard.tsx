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
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              Category 1: Foundation Check
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            Critical Technical Hygiene & Crawlability
            <SEOExplanationTooltip text="Verifies that your target page can be fetched, crawled, and indexed by search engine bots without security or canonical blocks." />
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Ensuring Googlebot can crawl and render your page before optimizing content depth.
          </p>
        </div>

        <div className="shrink-0">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
              isHealthy
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40'
            }`}
          >
            {isHealthy ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertOctagon className="w-4 h-4 text-red-500" />}
            <span>{isHealthy ? 'Technical Foundation Pass' : 'Action Required'}</span>
          </span>
        </div>
      </div>

      {/* Grid Status Checks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Crawlability */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-indigo-400" /> Page Crawlability
            </span>
            {isCrawlable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {isCrawlable ? 'Crawlable (HTTP 200)' : 'Unreachable / Empty'}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400">
            {isCrawlable ? 'Server returned valid HTML content.' : 'Bots cannot fetch HTML text.'}
          </p>
        </div>

        {/* 2. Indexability */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" /> Indexability Status
            </span>
            {isIndexable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {isIndexable ? 'Indexable Allowed' : 'Blocked / Noindex'}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400">
            {isIndexable ? 'Robots.txt & meta tags allow indexing.' : 'Robots rule prohibits indexing.'}
          </p>
        </div>

        {/* 3. HTTPS Security */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> SSL Encryption
            </span>
            {hasHttps ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {hasHttps ? 'Secure HTTPS' : 'Insecure HTTP'}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400">
            {hasHttps ? 'Valid SSL protocol active.' : 'Missing SSL encryption.'}
          </p>
        </div>

        {/* 4. Canonical Tag Match */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#080c14] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Canonical Tag Match
            </span>
            {hasCanonicalMatch ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {hasCanonicalMatch ? 'Self-Referencing / Valid' : 'Domain Mismatch'}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400">
            {hasCanonicalMatch ? 'Canonical URL aligns with target domain.' : 'Canonical points elsewhere.'}
          </p>
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
