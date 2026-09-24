'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Network,
  Link2,
  ExternalLink,
  Search,
  Filter,
  Check,
  Copy,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  Key,
  Layers,
  BarChart2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Plus,
  Loader2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { LinkItem, SinglePageAudit } from '@/types/seo';
import {
  analyzeLinkTopology,
  DetailedAnchorCategory,
  InternalTargetHub,
  LinkTopologyAnalysisResult,
} from '@/lib/link-topology-engine';
import { TopicClusterStrategyResult } from '@/lib/gemini';
import { AuthModal } from './AuthModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export interface InternalLinkTopologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialKeyword?: string;
  links?: LinkItem[];
  wordCount?: number;
  competitorAudits?: SinglePageAudit[];
  pageTitle?: string;
  headings?: Array<{ level: string; text: string } | string>;
}

export function InternalLinkTopologyModal({
  isOpen,
  onClose,
  initialUrl = '',
  initialKeyword = '',
  links = [],
  wordCount = 1000,
  competitorAudits = [],
  pageTitle = '',
  headings = [],
}: InternalLinkTopologyModalProps) {
  const modalRef = useFocusTrap({ isOpen, onClose });
  const [mounted, setMounted] = useState(false);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [activeMainTab, setActiveMainTab] = useState<'hubs' | 'all-links' | 'benchmarks'>('hubs');
  const [anchorFilter, setAnchorFilter] = useState<'all' | DetailedAnchorCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAnchor, setCopiedAnchor] = useState<string | null>(null);

  // AI Topic Cluster State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<TopicClusterStrategyResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute topology and anchor metrics
  const topology: LinkTopologyAnalysisResult = useMemo(() => {
    return analyzeLinkTopology(
      links,
      initialUrl,
      wordCount,
      keyword,
      competitorAudits
    );
  }, [links, initialUrl, wordCount, keyword, competitorAudits]);

  // Filtered internal links
  const filteredLinks = useMemo(() => {
    return topology.detailedLinks.filter((l) => {
      const matchesFilter =
        anchorFilter === 'all' || l.detailedAnchorCategory === anchorFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        l.text.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        l.href.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesFilter && matchesSearch;
    });
  }, [topology.detailedLinks, anchorFilter, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Anchor Text', 'Category', 'Target URL', 'Clean Path', 'Follow / Nofollow'];
    const rows = topology.detailedLinks.map((l) => [
      `"${l.text.replace(/"/g, '""')}"`,
      `"${l.detailedAnchorCategory}"`,
      `"${l.href}"`,
      `"${l.cleanDestinationPath}"`,
      l.isNofollow ? '"Nofollow"' : '"Dofollow"',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute('download', `internal-links-${(keyword || 'audit').replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnchor(text);
    setTimeout(() => setCopiedAnchor(null), 1500);
  };

  // Run AI Topic Cluster Strategy
  const handleGenerateAiCluster = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const headingList = headings.map((h) => (typeof h === 'string' ? h : h.text));
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'internal-link-strategy',
          pageTitle: pageTitle || initialUrl || 'SEO Guide',
          pageUrl: initialUrl || 'https://example.com',
          targetKeyword: keyword || 'technical seo',
          headings: headingList,
          existingLinks: links.slice(0, 15).map((l) => ({ href: l.href, text: l.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || data.requiresAuth) {
          setIsAuthModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Failed to generate topic cluster strategy.');
      }

      setAiResult(data.data);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (topology.healthScore.score / 100) * circumference;

  const strokeColor = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  }[topology.healthScore.ratingColor];

  const scoreBadgeColors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
  }[topology.healthScore.ratingColor];

  const categoryBadgeClasses: Record<DetailedAnchorCategory, string> = {
    'exact-match': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    'partial-match': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'branded': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'generic': 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    'naked-url': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="topology-modal-title"
        className="relative w-full max-w-[1580px] h-[94vh] flex flex-col bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
      >
        
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="topology-modal-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Internal Linking Topology &amp; Anchor Text Distribution
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  PageRank Flow
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                {initialUrl || 'Topic Cluster & Hub Architecture Analysis'}
              </p>
            </div>
          </div>

          {/* Keyword and Target Focus input */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs">
            <label htmlFor="topology-focus-keyword" className="text-slate-500 flex items-center gap-1 font-medium cursor-pointer">
              <Key className="w-3.5 h-3.5 text-indigo-500" /> Focus Keyword:
            </label>
            <input
              id="topology-focus-keyword"
              type="text"
              aria-label="Focus Keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Technical SEO Audit"
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none w-36 sm:w-48 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={topology.detailedLinks.length === 0}
              aria-label="Export all internal links and anchors to CSV"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              title="Export all internal links and anchors to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close internal link topology dialog"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title="Close Topology Studio (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Top 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
          <div className="p-3.5 sm:px-6 border-r border-slate-200/80 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Internal Links</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.internalCount}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">
                  ({Math.round((topology.internalCount / (topology.totalLinks || 1)) * 100)}% of total)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:px-6 border-r border-slate-200/80 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Unique Target Hubs</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.targetHubs.length}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">clusters</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:px-6 border-r border-slate-200/80 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Link Density (per 1k words)</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.internalDensityPer1kWords}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">links / 1k</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:px-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Dofollow Internal</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.internalCount > 0
                  ? `${Math.round(
                      ((topology.internalCount -
                        topology.detailedLinks.filter((l) => l.isNofollow).length) /
                        topology.internalCount) *
                        100
                    )}%`
                  : '100%'}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">pass equity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Panel Body */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT / MAIN WORKBENCH PANEL */}
          <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950">
            
            {/* Main Tabs Strip */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/30">
              <div role="tablist" aria-label="Internal link topology views" className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  role="tab"
                  id="tab-topology-hubs"
                  aria-selected={activeMainTab === 'hubs'}
                  aria-controls="panel-topology-hubs"
                  onClick={() => setActiveMainTab('hubs')}
                  className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeMainTab === 'hubs'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Destination Hubs ({topology.targetHubs.length})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-topology-all-links"
                  aria-selected={activeMainTab === 'all-links'}
                  aria-controls="panel-topology-all-links"
                  onClick={() => setActiveMainTab('all-links')}
                  className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeMainTab === 'all-links'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>All Internal Links ({topology.internalCount})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-topology-benchmarks"
                  aria-selected={activeMainTab === 'benchmarks'}
                  aria-controls="panel-topology-benchmarks"
                  onClick={() => setActiveMainTab('benchmarks')}
                  className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeMainTab === 'benchmarks'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Competitor Benchmarks ({topology.competitorBenchmarks.length})</span>
                </button>
              </div>

              {/* In-tab search (if on all-links or hubs) */}
              {activeMainTab === 'all-links' && (
                <div className="flex items-center gap-1.5 py-1.5">
                  <div className="relative">
                    <label htmlFor="topology-search-query" className="sr-only">Search anchor or URL</label>
                    <Search className="w-3 h-3 text-slate-500 dark:text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="topology-search-query"
                      type="text"
                      aria-label="Search anchor or URL"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search anchor or URL..."
                      className="pl-7 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 focus:outline-none w-44 sm:w-56 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TAB 1: Destination Hubs */}
            {activeMainTab === 'hubs' && (
              <div id="panel-topology-hubs" role="tabpanel" aria-labelledby="tab-topology-hubs" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <p>
                    Target destination silos that receive the highest internal link equity from this page:
                  </p>
                  <span className="font-mono text-[11px]">
                    {topology.targetHubs.length} Unique Destination Paths
                  </span>
                </div>

                <div className="border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 px-4">Destination Target Path</th>
                          <th className="py-2.5 px-3">Links Received</th>
                          <th className="py-2.5 px-3">Equity Share</th>
                          <th className="py-2.5 px-4">Sample Anchor Phrases Used</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {topology.targetHubs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                              No internal destination hubs discovered.
                            </td>
                          </tr>
                        ) : (
                          topology.targetHubs.map((hub, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 max-w-xs truncate font-medium">
                                {hub.cleanPath}
                              </td>

                              <td className="py-3 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 tabular-nums">
                                  {hub.linkCount}x
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-500 rounded-full"
                                      style={{ width: `${Math.min(100, hub.pctOfTotalInternal)}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                                    {hub.pctOfTotalInternal}%
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 max-w-sm">
                                <div className="flex flex-wrap gap-1">
                                  {hub.uniqueAnchors.slice(0, 3).map((anc, ai) => (
                                    <span
                                      key={ai}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]"
                                      title={anc}
                                    >
                                      &quot;{anc}&quot;
                                    </span>
                                  ))}
                                  {hub.uniqueAnchors.length > 3 && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                      +{hub.uniqueAnchors.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3 text-right">
                                <a
                                  href={hub.targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  <span>Visit</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: All Internal Links & Anchor Filters */}
            {activeMainTab === 'all-links' && (
              <div id="panel-topology-all-links" role="tabpanel" aria-labelledby="tab-topology-all-links" className="flex-1 flex flex-col p-4 sm:p-6 min-h-0">
                {/* Filter Pills */}
                <div role="radiogroup" aria-label="Anchor text category filter" className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={anchorFilter === 'all'}
                    onClick={() => setAnchorFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      anchorFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    All ({topology.detailedLinks.length})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={anchorFilter === 'exact-match'}
                    onClick={() => setAnchorFilter('exact-match')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      anchorFilter === 'exact-match'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                    }`}
                  >
                    Exact Match ({topology.anchorBreakdown.exactCount})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={anchorFilter === 'partial-match'}
                    onClick={() => setAnchorFilter('partial-match')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      anchorFilter === 'partial-match'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    Partial Match ({topology.anchorBreakdown.partialCount})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={anchorFilter === 'branded'}
                    onClick={() => setAnchorFilter('branded')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      anchorFilter === 'branded'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                    }`}
                  >
                    Branded ({topology.anchorBreakdown.brandedCount})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={anchorFilter === 'generic'}
                    onClick={() => setAnchorFilter('generic')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      anchorFilter === 'generic'
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    Generic / CTA ({topology.anchorBreakdown.genericCount})
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={anchorFilter === 'naked-url'}
                    onClick={() => setAnchorFilter('naked-url')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                      anchorFilter === 'naked-url'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    Naked URL ({topology.anchorBreakdown.nakedCount})
                  </button>
                </div>

                {/* Table */}
                <div className="flex-1 border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900/40 min-h-0 flex flex-col">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                        <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 px-4">Anchor Text</th>
                          <th className="py-2.5 px-3">Classification</th>
                          <th className="py-2.5 px-4">Destination Target</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredLinks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                              No internal links match current filters.
                            </td>
                          </tr>
                        ) : (
                          filteredLinks.map((link, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                                &quot;{link.text || '(empty anchor)'}&quot;
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    categoryBadgeClasses[link.detailedAnchorCategory]
                                  }`}
                                >
                                  {link.detailedAnchorCategory}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 max-w-sm truncate text-[11px]">
                                {link.cleanDestinationPath}
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    link.isNofollow
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  {link.isNofollow ? 'Nofollow' : 'Dofollow'}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(link.text)}
                                  aria-label={`Copy anchor text "${link.text || 'empty'}"`}
                                  className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                  title="Copy Anchor Text"
                                >
                                  {copiedAnchor === link.text ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Competitor Comparison */}
            {activeMainTab === 'benchmarks' && (
              <div id="panel-topology-benchmarks" role="tabpanel" aria-labelledby="tab-topology-benchmarks" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Side-by-side internal linking architecture comparison across all audited URLs in this SERP:
                </div>

                <div className="border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 px-4">Page Host / URL</th>
                          <th className="py-2.5 px-3">Internal Links</th>
                          <th className="py-2.5 px-3">Density (/1k words)</th>
                          <th className="py-2.5 px-3">Unique Hubs</th>
                          <th className="py-2.5 px-3">Int : Ext Ratio</th>
                          <th className="py-2.5 px-4">Top Anchor Texts Used</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {topology.competitorBenchmarks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                              No competitor audit results available to benchmark.
                            </td>
                          </tr>
                        ) : (
                          topology.competitorBenchmarks.map((comp, idx) => {
                            const isCurrent = comp.url === initialUrl;
                            return (
                              <tr
                                key={idx}
                                className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                                  isCurrent ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-medium' : ''
                                }`}
                              >
                                <td className="py-3 px-4 max-w-xs truncate">
                                  <div className="flex items-center gap-1.5">
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-indigo-500 text-white">
                                        You
                                      </span>
                                    )}
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                      {comp.host}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                    {comp.url}
                                  </div>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                                    {comp.totalInternalLinks}
                                  </span>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                    {comp.internalLinkDensity} / 1k
                                  </span>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                                    {comp.uniqueInternalHubs}
                                  </span>
                                </td>

                                <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                                  {comp.internalExternalRatio}
                                </td>

                                <td className="py-3 px-4 max-w-sm">
                                  <div className="flex flex-wrap gap-1">
                                    {comp.topAnchors.map((anc, ai) => (
                                      <span
                                        key={ai}
                                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]"
                                        title={anc}
                                      >
                                        &quot;{anc}&quot;
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT / INTELLIGENCE RADAR PANEL (w-full lg:w-[410px] xl:w-[440px]) */}
          <div className="w-full lg:w-[410px] xl:w-[440px] flex flex-col bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto">
            
            {/* Health Score & Circular Gauge */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-4">
                
                {/* Radial Gauge */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="7"
                      fill="transparent"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke={strokeColor}
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
                      {topology.healthScore.score}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 -mt-0.5">
                      Health
                    </span>
                  </div>
                </div>

                {/* Score Status */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border mb-1.5 ${scoreBadgeColors}`}
                  >
                    {topology.healthScore.ratingLabel}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {topology.healthScore.isOverOptimized
                      ? 'Warning: Exact match anchor concentration exceeds 35% Google penalty safety threshold.'
                      : 'Internal link profile exhibits natural distribution and healthy topical cluster hierarchy.'}
                  </p>
                </div>
              </div>

              {/* Anchor Distribution Stacked Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Anchor Text Distribution Breakdown
                </span>

                {/* Multi-segment Bar */}
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
                  <div
                    className="bg-purple-500 transition-all duration-300"
                    style={{ width: `${topology.anchorBreakdown.exactPct}%` }}
                    title={`Exact Match: ${topology.anchorBreakdown.exactPct}%`}
                  />
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{ width: `${topology.anchorBreakdown.partialPct}%` }}
                    title={`Partial Match: ${topology.anchorBreakdown.partialPct}%`}
                  />
                  <div
                    className="bg-blue-500 transition-all duration-300"
                    style={{ width: `${topology.anchorBreakdown.brandedPct}%` }}
                    title={`Branded: ${topology.anchorBreakdown.brandedPct}%`}
                  />
                  <div
                    className="bg-slate-400 transition-all duration-300"
                    style={{ width: `${topology.anchorBreakdown.genericPct}%` }}
                    title={`Generic: ${topology.anchorBreakdown.genericPct}%`}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-300"
                    style={{ width: `${topology.anchorBreakdown.nakedPct}%` }}
                    title={`Naked URL: ${topology.anchorBreakdown.nakedPct}%`}
                  />
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Exact: {topology.anchorBreakdown.exactPct}% ({topology.anchorBreakdown.exactCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Partial: {topology.anchorBreakdown.partialPct}% ({topology.anchorBreakdown.partialCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Branded: {topology.anchorBreakdown.brandedPct}% ({topology.anchorBreakdown.brandedCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400" />
                    <span>Generic: {topology.anchorBreakdown.genericPct}% ({topology.anchorBreakdown.genericCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anchor Gaps (Competitor Opportunities) */}
            {topology.anchorGaps.length > 0 && (
              <div className="p-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-100/40 dark:bg-slate-900/30 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Competitor Anchor Opportunities (Gaps)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Descriptive anchors competitors use to pass topical relevance that your page currently lacks:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topology.anchorGaps.map((gap, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopyText(gap)}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                      title="Click to copy recommended anchor"
                    >
                      <span>&quot;{gap}&quot;</span>
                      <Copy className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Topic Cluster & Link Architect Drawer */}
            <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI Topic Cluster Architect
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  Gemini 3.6 Flash
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Engineer a high-authority Hub-and-Spoke cluster. Recommends strategic contextual anchors and spoke pages to pass PageRank to your money pages.
              </p>

              <button
                onClick={handleGenerateAiCluster}
                disabled={isAiLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Architecting Cluster...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate Topic Cluster Strategy</span>
                  </>
                )}
              </button>

              {aiError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  {aiError}
                </div>
              )}

              {/* AI Strategy Result */}
              {aiResult && (
                <div className="mt-2 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.04] space-y-3 text-xs overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[11px]">
                      Cluster Role: {aiResult.clusterRole.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Recommended Spoke Pages:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      {aiResult.recommendedSpokes.map((spoke, sIdx) => (
                        <li key={sIdx}>{spoke}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Contextual Link Placements:
                    </div>
                    {aiResult.recommendedInternalLinks.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-indigo-600 dark:text-indigo-400">
                          <span>&quot;{rec.anchorText}&quot;</span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {rec.suggestedUrlPath}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                          &quot;{rec.contextSentence}&quot;
                        </p>
                        <button
                          onClick={() => handleCopyText(rec.contextSentence)}
                          className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-0.5"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy Sentence</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {aiResult.topicalAuthorityTip && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
                      <strong>Topical Authority Tip:</strong> {aiResult.topicalAuthorityTip}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          featureTitle="Topic Cluster & Internal Link AI"
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
