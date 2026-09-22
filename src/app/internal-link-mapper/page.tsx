'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InternalLinkTopologyModal } from '@/components/InternalLinkTopologyModal';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import {
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
  TrendingUp,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import { LinkItem, SinglePageAudit } from '@/types/seo';
import {
  analyzeLinkTopology,
  DetailedAnchorCategory,
  InternalTargetHub,
  LinkTopologyAnalysisResult,
} from '@/lib/link-topology-engine';

const SAMPLE_INITIAL_URL = 'https://example.com/blog/technical-seo-guide';

const SAMPLE_LINKS: LinkItem[] = [
  { href: 'https://example.com/features/site-audit', text: 'technical seo audit tool', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/features/site-audit', text: 'automated site audit', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/features/site-audit', text: 'click here', isExternal: false, isNofollow: false, anchorCategory: 'Generic', isAffiliate: false },
  { href: 'https://example.com/blog/core-web-vitals', text: 'core web vitals optimization guide', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/blog/core-web-vitals', text: 'LCP benchmarks', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/tools/schema-validator', text: 'schema markup generator', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/tools/schema-validator', text: 'JSON-LD structured data', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/pricing', text: 'AnalyzeSERP pricing', isExternal: false, isNofollow: false, anchorCategory: 'Branded', isAffiliate: false },
  { href: 'https://example.com/pricing', text: 'view our beta plans', isExternal: false, isNofollow: false, anchorCategory: 'Generic', isAffiliate: false },
  { href: 'https://example.com/blog/internal-linking', text: 'internal link architecture', isExternal: false, isNofollow: false, anchorCategory: 'Keyword-Rich', isAffiliate: false },
  { href: 'https://example.com/blog/internal-linking', text: 'https://example.com/blog/internal-linking', isExternal: false, isNofollow: false, anchorCategory: 'Generic', isAffiliate: false },
  { href: 'https://example.com/about', text: 'AnalyzeSERP', isExternal: false, isNofollow: false, anchorCategory: 'Branded', isAffiliate: false },
  { href: 'https://developers.google.com/search', text: 'Google Search Central Documentation', isExternal: true, isNofollow: false, anchorCategory: 'Branded', isAffiliate: false },
  { href: 'https://w3.org', text: 'W3C Web Standards', isExternal: true, isNofollow: true, anchorCategory: 'Branded', isAffiliate: false },
];

const FAQS = [
  {
    q: 'What is Internal Linking Topology in SEO?',
    a: 'Internal Linking Topology is the structural graph of how pages on a website link to one another. Search engine crawlers (like Googlebot) use this topology to discover new content, determine topical clusters (Hub-and-Spoke model), and distribute PageRank authority to high-converting money pages.',
  },
  {
    q: 'What are the 5 anchor text categories and why do they matter?',
    a: 'We categorize anchors into Exact Match (target keyword), Partial/Semantic Match (keyword variations), Branded (company name), Generic (e.g. "click here", "read more"), and Naked URL. Google algorithms evaluate anchor diversity to spot artificial manipulation. If exact match anchors exceed 35%, pages risk search quality penalties.',
  },
  {
    q: 'What is a Destination Hub in internal link architecture?',
    a: 'A Destination Hub (or Pillar Page) is an important target URL on your domain that receives multiple contextual internal links from supporting subtopic articles (spokes). Concentrating internal links on key hubs signals to Google that the page is an authoritative cornerstone resource.',
  },
  {
    q: 'How does internal link density affect organic rankings?',
    a: 'A healthy internal link density is typically 3 to 8 internal links per 1,000 words. Too few links leaves pages orphaned and starves them of PageRank, while too many links (> 25 per 1,000 words) dilutes the link equity passed to each target page.',
  },
];

export default function InternalLinkMapperPage() {
  const [targetUrl, setTargetUrl] = useState(SAMPLE_INITIAL_URL);
  const [keyword, setKeyword] = useState('technical seo audit');
  const [activeMainTab, setActiveMainTab] = useState<'hubs' | 'all-links'>('hubs');
  const [anchorFilter, setAnchorFilter] = useState<'all' | DetailedAnchorCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Compute topology
  const topology: LinkTopologyAnalysisResult = useMemo(() => {
    return analyzeLinkTopology(SAMPLE_LINKS, targetUrl, 1400, keyword);
  }, [targetUrl, keyword]);

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

  // SVG circular gauge
  const radius = 36;
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

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-700 dark:selection:text-indigo-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <Navbar onOpenProModal={() => setIsProModalOpen(true)} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Internal Link Topology Mapper
          </span>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Network className="w-3.5 h-3.5" />
            <span>PageRank Flow &amp; Topic Cluster Intelligence • 100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight text-balance">
            Competitor Internal Linking Topology &amp; Anchor Text Distribution Mapper
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-balance">
            Uncover how top-ranking Google competitors architect their topic clusters, distribute PageRank to target hubs, and balance anchor text diversity to avoid search spam penalties.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Launch Full-Screen Topology Studio</span>
            </button>
            <Link
              href="/audit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Run Live Competitor Audit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Embedded Interactive Workbench */}
        <section className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
          
          {/* Top Workbench Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Network className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Topology Studio Demo Workbench
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-lg text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Key className="w-3 h-3 text-indigo-500" /> Focus Keyword:
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none w-36 sm:w-48"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </button>
            </div>
          </div>

          {/* Workbench Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
            <div className="p-3.5 sm:px-6 border-r border-slate-200/80 dark:border-white/10">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Internal Links</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.internalCount}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  ({Math.round((topology.internalCount / (topology.totalLinks || 1)) * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:px-6 border-r border-slate-200/80 dark:border-white/10">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Destination Hubs</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.targetHubs.length}
                <span className="text-xs text-slate-400 font-normal ml-1">clusters</span>
              </div>
            </div>

            <div className="p-3.5 sm:px-6 border-r border-slate-200/80 dark:border-white/10">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Link Density</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {topology.internalDensityPer1kWords}
                <span className="text-xs text-slate-400 font-normal ml-1">/ 1k words</span>
              </div>
            </div>

            <div className="p-3.5 sm:px-6">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Dofollow Equity</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                100%
                <span className="text-xs text-slate-400 font-normal ml-1">pass equity</span>
              </div>
            </div>
          </div>

          {/* Workbench Columns */}
          <div className="flex flex-col lg:flex-row h-[600px]">
            
            {/* Main Tabs Column */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMainTab('hubs')}
                    className={`py-3 px-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeMainTab === 'hubs'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Destination Hubs ({topology.targetHubs.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveMainTab('all-links')}
                    className={`py-3 px-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeMainTab === 'all-links'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>All Internal Links ({topology.internalCount})</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Hubs */}
              {activeMainTab === 'hubs' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-2 px-3">Target Path</th>
                        <th className="py-2 px-3">Links</th>
                        <th className="py-2 px-3">Share</th>
                        <th className="py-2 px-3">Sample Anchors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {topology.targetHubs.map((hub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200 truncate max-w-xs font-medium">
                            {hub.cleanPath}
                          </td>
                          <td className="py-2.5 px-3 font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                            {hub.linkCount}x
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {hub.pctOfTotalInternal}%
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {hub.uniqueAnchors.slice(0, 2).map((a, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                                  &quot;{a}&quot;
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: All Links */}
              {activeMainTab === 'all-links' && (
                <div className="flex-1 flex flex-col p-4 min-h-0">
                  <div className="flex items-center gap-1 mb-2 overflow-x-auto text-[10px]">
                    <button
                      onClick={() => setAnchorFilter('all')}
                      className={`px-2 py-0.5 rounded-full ${anchorFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                      All ({topology.detailedLinks.length})
                    </button>
                    <button
                      onClick={() => setAnchorFilter('exact-match')}
                      className={`px-2 py-0.5 rounded-full ${anchorFilter === 'exact-match' ? 'bg-purple-600 text-white' : 'bg-purple-500/10 text-purple-600'}`}
                    >
                      Exact Match ({topology.anchorBreakdown.exactCount})
                    </button>
                    <button
                      onClick={() => setAnchorFilter('partial-match')}
                      className={`px-2 py-0.5 rounded-full ${anchorFilter === 'partial-match' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-600'}`}
                    >
                      Partial Match ({topology.anchorBreakdown.partialCount})
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-500 uppercase">
                          <th className="py-2 px-3">Anchor Text</th>
                          <th className="py-2 px-3">Classification</th>
                          <th className="py-2 px-3">Target Path</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredLinks.map((l, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs">
                              &quot;{l.text}&quot;
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${categoryBadgeClasses[l.detailedAnchorCategory]}`}>
                                {l.detailedAnchorCategory}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                              {l.cleanDestinationPath}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Gauge and Anchor Distribution Column */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-4 overflow-y-auto">
              {/* Score card */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke={strokeColor}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                      {topology.healthScore.score}
                    </span>
                    <span className="text-[8px] font-semibold text-slate-400 uppercase -mt-0.5">Health</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border mb-1 ${scoreBadgeColors}`}>
                    {topology.healthScore.ratingLabel}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {topology.healthScore.isOverOptimized
                      ? 'High exact match risk detected.'
                      : 'Internal links are naturally balanced.'}
                  </p>
                </div>
              </div>

              {/* Stacked bar */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 space-y-2 text-xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Anchor Distribution
                </span>

                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
                  <div className="bg-purple-500" style={{ width: `${topology.anchorBreakdown.exactPct}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${topology.anchorBreakdown.partialPct}%` }} />
                  <div className="bg-blue-500" style={{ width: `${topology.anchorBreakdown.brandedPct}%` }} />
                  <div className="bg-slate-400" style={{ width: `${topology.anchorBreakdown.genericPct}%` }} />
                  <div className="bg-amber-500" style={{ width: `${topology.anchorBreakdown.nakedPct}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1">
                  <div>Exact: {topology.anchorBreakdown.exactPct}%</div>
                  <div>Partial: {topology.anchorBreakdown.partialPct}%</div>
                  <div>Branded: {topology.anchorBreakdown.brandedPct}%</div>
                  <div>Generic: {topology.anchorBreakdown.genericPct}%</div>
                </div>
              </div>

              {/* Opportunities */}
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Anchor Opportunities
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Descriptive phrases competitors link to that help build topical authority:
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                    &quot;technical site audit&quot;
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                    &quot;core web vitals checklist&quot;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Steps Workflow */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              How to Master Internal Linking in 3 Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Architect an authoritative topic cluster that passes equity directly to your money pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Identify Target Destination Hubs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Determine which product, feature, or cornerstone pages should receive the majority of your internal link equity.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Audit Anchor Text Diversity
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep Exact Match anchors under 20% to prevent over-optimization flags. Balance with Partial Match descriptive phrases.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Benchmark Against SERP Competitors
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Compare internal link density and target hubs against top-ranking pages to discover missing anchor opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Pillars Bento Grid */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Why Internal Link Topology Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Internal linking is Google&apos;s #1 on-page mechanism for understanding site hierarchy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hub &amp; Silo Discovery</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically maps which destination URLs receive the most link equity from your content cluster.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">5-Tier Anchor Classification</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Segment exact match, partial descriptive, branded, generic, and naked URLs with precision.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Over-Optimization Guard</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detects unnatural anchor text repetition and flags penalty risks before search engines do.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">PageRank Flow Control</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct PageRank efficiently to conversion assets instead of wasting crawl budget on thin pages.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="space-y-6 pt-4 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Everything you need to know about internal link topology and anchor distribution.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-indigo-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      {isModalOpen && (
        <InternalLinkTopologyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialUrl={targetUrl}
          initialKeyword={keyword}
          links={SAMPLE_LINKS}
          wordCount={1400}
        />
      )}

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  );
}
