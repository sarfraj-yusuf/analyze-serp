'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { AiRewriteModal } from '@/components/AiRewriteModal';
import { Logo } from '@/components/Logo';
import { DbUserAudit, DbUserAiActivity } from '@/lib/db';
import { UserCreditsInfo } from '@/lib/user-credits';
import {
  Zap,
  Globe,
  Sparkles,
  Search,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileText,
  Activity,
  Target,
  ArrowRight,
  Filter,
  Layers,
  Code2,
  Lock,
  LayoutDashboard,
  Gauge,
  Palette,
  Share2,
  Link2,
  Eye,
  Trash2,
  History,
  GitCompare,
  Camera,
} from 'lucide-react';

interface DashboardSnapshotItem {
  id: number;
  url: string;
  label: string;
  score: number;
  target_keyword?: string | null;
  created_at: string | Date;
}

interface DashboardHistoryData {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  credits: UserCreditsInfo;
  audits: DbUserAudit[];
  snapshots?: DashboardSnapshotItem[];
  aiActivities: DbUserAiActivity[];
  stats: {
    totalAudits: number;
    totalAiGenerations: number;
    avgScore: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audits' | 'snapshots' | 'ai' | 'tools'>('audits');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAuditForAi, setSelectedAuditForAi] = useState<{ url: string; title: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [deletingAuditId, setDeletingAuditId] = useState<number | null>(null);
  const [deletingSnapshotId, setDeletingSnapshotId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/history')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setData(json);
          }
        })
        .catch((err) => console.error('Failed to load dashboard data:', err))
        .finally(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAiRewrite = (url: string, title?: string | null) => {
    setSelectedAuditForAi({ url, title: title || '' });
    setShowAiModal(true);
  };

  // Filtered audits by search and score
  const filteredAudits = (data?.audits || []).filter((item) => {
    // 1. Text filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match =
        item.url.toLowerCase().includes(query) ||
        (item.title && item.title.toLowerCase().includes(query));
      if (!match) return false;
    }

    // 2. Score filter
    if (scoreFilter === 'HIGH') {
      return typeof item.score === 'number' && item.score >= 80;
    }
    if (scoreFilter === 'LOW') {
      return typeof item.score === 'number' && item.score < 80;
    }

    return true;
  });

  // Filtered snapshots by search and score
  const filteredSnapshots = (data?.snapshots || []).filter((item) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match =
        item.url.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        (item.target_keyword && item.target_keyword.toLowerCase().includes(query));
      if (!match) return false;
    }
    if (scoreFilter === 'HIGH') {
      return typeof item.score === 'number' && item.score >= 80;
    }
    if (scoreFilter === 'LOW') {
      return typeof item.score === 'number' && item.score < 80;
    }
    return true;
  });

  // Delete an audit history record
  const handleDeleteAudit = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this audit from your history?')) return;
    setDeletingAuditId(id);
    try {
      const res = await fetch(`/api/user/history?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            audits: prev.audits.filter((a) => a.id !== id),
            stats: {
              ...prev.stats,
              totalAudits: Math.max(0, prev.stats.totalAudits - 1),
            },
          };
        });
      }
    } catch (err) {
      console.error('Failed to delete audit:', err);
    } finally {
      setDeletingAuditId(null);
    }
  };

  // Delete a saved snapshot record
  const handleDeleteSnapshot = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this saved snapshot?')) return;
    setDeletingSnapshotId(id);
    try {
      const res = await fetch(`/api/audit/snapshots?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            snapshots: (prev.snapshots || []).filter((s) => s.id !== id),
          };
        });
      }
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    } finally {
      setDeletingSnapshotId(null);
    }
  };

  const credits = data?.credits || {
    remainingCredits: 5,
    limit: 5,
    usedCredits: 0,
    resetInHours: 24,
  };
  const stats = data?.stats || { totalAudits: 0, totalAiGenerations: 0, avgScore: 0 };
  const creditsPercentage = Math.round((credits.remainingCredits / credits.limit) * 100);

  // Unauthenticated Guest State
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-white/10 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-center">
              <Logo variant="icon" size="xl" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Member Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Sign In to Access Your Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Connect your account to view your past website audit logs, manage daily Gemini AI credits, and re-run audits with 1 click.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 grid grid-cols-2 gap-3 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Persistent Audit Logs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>5 Free AI Credits Daily</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>1-Click Re-run Audits</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>White-Label PDF Reports</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              Sign In with Google or GitHub
            </button>
          </div>
        </main>

        <Footer />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          featureTitle="SEO Dashboard Access"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Global Navigation Bar */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Workspace Breadcrumbs & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
              <Link href="/" className="hover:text-emerald-500 transition-colors">AnalyzeSERP</Link>
              <span>/</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">User Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <LayoutDashboard className="w-6 h-6 text-emerald-500" />
              <span>Personal SEO Workspace</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Monitor your analyzed websites, track daily Gemini AI credits, and manage past optimizations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Audit New Webpage</span>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
              <div className="h-44 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        ) : (
          <>
            {/* Top Deck: Profile Card & Live AI Credits Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex items-center gap-3.5">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User Avatar'}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {session?.user?.name || 'SEO Specialist'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                      {session?.user?.email}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Free Member · 5 Daily Credits</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>OAuth 2.0 Verified</span>
                  </span>
                  <span className="font-mono text-[11px]">Resets Daily</span>
                </div>
              </div>

              {/* ⚡ Live AI Credits Widget */}
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1">
                      <Zap className="w-3 h-3 fill-amber-500" />
                      <span>Daily AI Quota Balance</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono">{credits.remainingCredits}</span>
                      <span className="text-slate-400 text-base font-normal">/ {credits.limit} Credits Remaining Today</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">Resets in ~{credits.resetInHours}h</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Used today: {credits.usedCredits} credits</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{creditsPercentage}% Available</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                      style={{ width: `${creditsPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick AI Action Pills */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAuditForAi(null);
                      setShowAiModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open AI Meta Rewriter</span>
                  </button>
                  <Link
                    href="/pdf-reports"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-all border border-slate-200/80 dark:border-white/10"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>White-Label PDF Reports</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                  <span>Total Audits</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  {stats.totalAudits}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Pages analyzed</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                  <span>AI Actions Run</span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  {stats.totalAiGenerations}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Rewrites &amp; code fixes</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                  <span>Average Health</span>
                  <Target className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  {stats.avgScore > 0 ? `${stats.avgScore}/100` : 'N/A'}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Technical Score</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                  <span>Quota Reset</span>
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  24h
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Auto credit refill</span>
              </div>
            </div>

            {/* Main Interactive Tabbed History Section */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
              {/* Workspace Navigation Tabs & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
                {/* Segmented Tab Controls */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 self-start lg:self-auto overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setActiveTab('audits')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'audits'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Audit History ({data?.audits?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('snapshots')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'snapshots'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-teal-500" />
                    <span>Saved Snapshots ({data?.snapshots?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'ai'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Activity Log ({data?.aiActivities?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tools')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'tools'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    <span>SEO Toolkits</span>
                  </button>
                </div>

                {/* Search & Score Filters (Shown on Audits & Snapshots Tabs) */}
                {(activeTab === 'audits' || activeTab === 'snapshots') && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Score Filter Pills */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setScoreFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          scoreFilter === 'ALL'
                            ? 'bg-white text-slate-800 dark:bg-slate-800 dark:text-white shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        All ({activeTab === 'snapshots' ? (data?.snapshots?.length || 0) : (data?.audits?.length || 0)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setScoreFilter('HIGH')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          scoreFilter === 'HIGH'
                            ? 'bg-white text-emerald-600 dark:bg-slate-800 dark:text-emerald-400 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        80+ Good
                      </button>
                      <button
                        type="button"
                        onClick={() => setScoreFilter('LOW')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          scoreFilter === 'LOW'
                            ? 'bg-white text-amber-600 dark:bg-slate-800 dark:text-amber-400 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        &lt;80 Low
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={activeTab === 'snapshots' ? "Search snapshots by URL or label..." : "Search audited URLs..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-1.5 rounded-xl glass-input text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tab 1: Audit History List */}
              {activeTab === 'audits' && (
                <div className="space-y-3">
                  {filteredAudits.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {searchQuery ? 'No matching audits found' : 'No audits saved yet'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {searchQuery
                          ? 'Try searching with a different URL or keyword.'
                          : 'Analyze any live website from the homepage to automatically save it to your history.'}
                      </p>
                      {!searchQuery && (
                        <Link
                          href="/"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Run Your First Audit</span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {filteredAudits.map((item) => {
                        const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        const matchingSnapshot = (data?.snapshots || []).find((s) => s.url === item.url);

                        return (
                          <div
                            key={item.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors truncate flex items-center gap-1.5"
                                >
                                  <span>{item.url}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </a>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {item.title || 'Audited Webpage'}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                                <span>{dateStr}</span>
                                {item.word_count && <span>• {item.word_count.toLocaleString()} words</span>}
                              </div>
                            </div>

                            {/* Score Badge & Quick Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              {item.score !== null && (
                                <div
                                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                                    item.score >= 80
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                      : item.score >= 50
                                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                  }`}
                                >
                                  {item.score}/100
                                </div>
                              )}

                              {/* View Saved Full Report */}
                              <Link
                                href={matchingSnapshot ? `/audit?snapshotId=${matchingSnapshot.id}` : `/audit?urls=${encodeURIComponent(item.url)}`}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                                title={matchingSnapshot ? "View full saved report (0s latency, no credits used)" : "Open in competitor workspace"}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Report</span>
                              </Link>

                              {/* Re-run Audit Action */}
                              <Link
                                href={`/?url=${encodeURIComponent(item.url)}`}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200/80 dark:border-white/10"
                                title="Re-run live audit"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Re-run</span>
                              </Link>

                              {/* Open AI Rewrite Action */}
                              <button
                                type="button"
                                onClick={() => handleOpenAiRewrite(item.url, item.title)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/20 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">AI Rewrite</span>
                              </button>

                              {/* Copy URL */}
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(item.url, item.id)}
                                aria-label="Copy URL"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>

                              {/* Delete Audit History Row */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAudit(item.id)}
                                disabled={deletingAuditId === item.id}
                                aria-label="Delete audit"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-500/10 text-slate-400 hover:text-red-500 dark:bg-white/5 dark:hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-40"
                                title="Remove from history"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Saved Snapshots & Version History */}
              {activeTab === 'snapshots' && (
                <div className="space-y-3">
                  {filteredSnapshots.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {searchQuery ? 'No matching snapshots found' : 'No saved snapshots yet'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {searchQuery
                          ? 'Try searching with a different URL or snapshot label.'
                          : 'Every full audit you perform is automatically saved as a versioned cloud snapshot so you can restore and diff it anytime.'}
                      </p>
                      {!searchQuery && (
                        <Link
                          href="/"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Run an Audit to Create Baseline</span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {filteredSnapshots.map((item) => {
                        const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={item.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                                  <History className="w-3 h-3" />
                                  <span>{item.label || 'Saved Snapshot'}</span>
                                </span>
                                {item.target_keyword && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300">
                                    <Target className="w-3 h-3 text-emerald-500" />
                                    <span>Query: "{item.target_keyword}"</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors truncate flex items-center gap-1.5"
                                >
                                  <span>{item.url}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </a>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                                <span>Saved on {dateStr}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Cloud Synced</span>
                              </div>
                            </div>

                            {/* Score & Snapshot Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              {item.score !== null && (
                                <div
                                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                                    item.score >= 80
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                      : item.score >= 50
                                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                  }`}
                                >
                                  {item.score}/100
                                </div>
                              )}

                              {/* Restore Full Audit Report (0s latency) */}
                              <Link
                                href={`/audit?snapshotId=${item.id}`}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                                title="Open full snapshot report with zero latency"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Open Report</span>
                              </Link>

                              {/* Compare Diff */}
                              <Link
                                href={`/audit?snapshotId=${item.id}&openDiff=true`}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200/80 dark:border-white/10"
                                title="Compare against live or other snapshots"
                              >
                                <GitCompare className="w-3.5 h-3.5 text-slate-400" />
                                <span className="hidden sm:inline">Compare Diff</span>
                              </Link>

                              {/* Delete Snapshot */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSnapshot(item.id)}
                                disabled={deletingSnapshotId === item.id}
                                aria-label="Delete snapshot"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-500/10 text-slate-400 hover:text-red-500 dark:bg-white/5 dark:hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-40"
                                title="Delete saved snapshot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: AI Activity Log */}
              {activeTab === 'ai' && (
                <div className="space-y-3">
                  {(!data?.aiActivities || data.aiActivities.length === 0) ? (
                    <div className="py-12 text-center space-y-3">
                      <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        No AI generations logged yet
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Use the AI Rewrite button on any audit or simulator to generate high-CTR titles and code fixes.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {data.aiActivities.map((act) => {
                        const dateStr = new Date(act.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={act.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 first:pt-0 last:pb-0"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                  {act.action_type.replace('-', ' ')}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {act.target_summary}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {act.result_summary}
                              </p>
                            </div>

                            <div className="text-[11px] font-mono text-slate-400 shrink-0">
                              {dateStr}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Quick Toolkits Hub */}
              {activeTab === 'tools' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  <Link
                    href="/technical-health"
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Technical Health Audit</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Inspect TTFB latency, DOM depth, and HTML hygiene against Chrome benchmarks.
                    </p>
                  </Link>

                  <Link
                    href="/site-speed-checker"
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Site Speed &amp; CWV</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Analyze Google Core Web Vitals (LCP, INP, CLS) with field diagnostic insights.
                    </p>
                  </Link>

                  <Link
                    href="/serp-snippet-preview"
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">SERP &amp; Social Simulator</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Preview title &amp; description truncation with live 600px desktop meters.
                    </p>
                  </Link>

                  <Link
                    href="/contrast-checker"
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Palette className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">WCAG Color Contrast</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Live website stylesheet extraction and WCAG 2.1 AA/AAA compliance analyzer.
                    </p>
                  </Link>

                  <Link
                    href="/redirect-checker"
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Redirect Chain Tracer</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Trace 301/302 multi-hop redirect chains and resolve link equity latency.
                    </p>
                  </Link>

                  <Link
                    href="/pdf-reports"
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-slate-900/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">White-Label PDF Reports</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Generate executive client-ready audit reports with custom agency branding.
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        featureTitle="SEO Dashboard Access"
      />

      <AiRewriteModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        currentTitle={selectedAuditForAi?.title || ''}
        pageUrl={selectedAuditForAi?.url || ''}
      />
    </div>
  );
}
