'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Lock,
  Key,
  Users,
  Activity,
  Zap,
  Star,
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Filter,
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  Plus,
  RotateCcw,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  ExternalLink,
  Sparkles,
  Check,
  SlidersHorizontal,
  ChevronRight,
  Globe,
  Target,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface DbUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  provider: string;
  provider_id: string;
  daily_ai_credits_used: number;
  daily_ai_credits_limit: number;
  role?: 'user' | 'pro' | 'admin';
  status?: 'active' | 'suspended';
  last_credit_reset: string | Date;
  created_at: string | Date;
}

interface UserUsageRow {
  ip: string;
  sessionId: string;
  totalUses: number;
  toolBreakdown: Record<string, number>;
  lastUsedAt: string;
  urls: string[];
}

interface FeedbackRow {
  id: number;
  user_type: string;
  rating: number;
  category: string;
  message: string;
  email: string | null;
  ip_address: string;
  created_at: string;
}

interface ChartToolItem {
  tool: string;
  count: number;
  percentage: number;
}

interface ChartTierItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface ChartTimelineItem {
  date: string;
  count: number;
}

export interface MarketIntelligenceData {
  topDomains: { domain: string; count: number; percentage: number; lastAuditedAt: string }[];
  topKeywords: { keyword: string; count: number; avgScore: number; lastUsedAt: string }[];
  scoreDistribution: { range: string; label: string; count: number; percentage: number; color: string }[];
  recentSnapshots: {
    id: number;
    user_email: string;
    url: string;
    label: string | null;
    score: number;
    target_keyword: string | null;
    created_at: string | Date;
  }[];
  uniqueDomainsCount: number;
  uniqueKeywordsCount: number;
  platformAvgScore: number;
}

interface AdminData {
  summary: {
    totalVisitors: number;
    totalAuditsRun: number;
    topTool: string;
    avgRating: number;
    totalReviews: number;
    toolUsageCounts: Record<string, number>;
    totalRegisteredUsers: number;
    proUsersCount: number;
    freeUsersCount: number;
    activeUsersCount: number;
    suspendedUsersCount: number;
    uniqueDomainsCount?: number;
    uniqueKeywordsCount?: number;
    platformAvgScore?: number;
  };
  charts: {
    toolBreakdownChart: ChartToolItem[];
    userTierChart: ChartTierItem[];
    userStatusChart: { name: string; count: number; percentage: number; color: string }[];
    recentActivityTimeline: ChartTimelineItem[];
  };
  marketIntelligence?: MarketIntelligenceData;
  usersList: DbUser[];
  userTable: UserUsageRow[];
  feedbackTable: FeedbackRow[];
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'market' | 'usage' | 'feedback'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'pro' | 'free' | 'suspended'>('all');
  const [selectedToolFilter, setSelectedToolFilter] = useState('All');
  const [actionInProgressEmail, setActionInProgressEmail] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const fetchAdminData = async (keyToUse: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'x-admin-key': keyToUse },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate admin key.');
      }

      setAdminData(data);
      setIsAuthenticated(true);
      localStorage.setItem('analyze_admin_key', keyToUse);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while loading admin panel.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('analyze_admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      fetchAdminData(savedKey);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    fetchAdminData(adminKey.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('analyze_admin_key');
    setIsAuthenticated(false);
    setAdminData(null);
    setAdminKey('');
  };

  // Perform Admin Mutation Action
  const executeUserAction = async (
    email: string,
    action: 'ADJUST_CREDITS' | 'ADD_BONUS_CREDITS' | 'RESET_USAGE' | 'TOGGLE_ROLE' | 'TOGGLE_STATUS',
    value?: any
  ) => {
    setActionInProgressEmail(email);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ email, action, value }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to perform admin action.');
      }

      showToast(resData.message || 'Action executed successfully.');

      // Update state locally
      if (resData.user && adminData) {
        setAdminData((prev) => {
          if (!prev) return null;
          const updatedUsers = prev.usersList.map((u) => (u.email === email ? resData.user : u));
          return {
            ...prev,
            usersList: updatedUsers,
            summary: {
              ...prev.summary,
              proUsersCount: updatedUsers.filter((u) => u.role === 'pro').length,
              freeUsersCount: updatedUsers.filter((u) => u.role !== 'pro').length,
              suspendedUsersCount: updatedUsers.filter((u) => u.status === 'suspended').length,
              activeUsersCount: updatedUsers.filter((u) => u.status !== 'suspended').length,
            },
          };
        });
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionInProgressEmail(null);
    }
  };

  // Filter Users
  const filteredUsers = useMemo(() => {
    if (!adminData?.usersList) return [];
    return adminData.usersList.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        u.provider.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (userRoleFilter === 'pro') return u.role === 'pro';
      if (userRoleFilter === 'free') return u.role !== 'pro';
      if (userRoleFilter === 'suspended') return u.status === 'suspended';
      return true;
    });
  }, [adminData?.usersList, searchQuery, userRoleFilter]);

  // Filter Usage Logs
  const filteredUserTable = useMemo(() => {
    if (!adminData?.userTable) return [];
    return adminData.userTable.filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        user.ip.toLowerCase().includes(q) ||
        user.sessionId.toLowerCase().includes(q) ||
        user.urls.some((u) => u.toLowerCase().includes(q));

      const matchesTool =
        selectedToolFilter === 'All' || Boolean(user.toolBreakdown[selectedToolFilter]);

      return matchesSearch && matchesTool;
    });
  }, [adminData?.userTable, searchQuery, selectedToolFilter]);

  // Filter Feedback Table
  const filteredFeedbackTable = useMemo(() => {
    if (!adminData?.feedbackTable) return [];
    return adminData.feedbackTable.filter((fb) => {
      const q = searchQuery.toLowerCase();
      return (
        fb.message.toLowerCase().includes(q) ||
        fb.category.toLowerCase().includes(q) ||
        fb.user_type.toLowerCase().includes(q) ||
        (fb.email && fb.email.toLowerCase().includes(q))
      );
    });
  }, [adminData?.feedbackTable, searchQuery]);

  // Filter Market Intelligence (Domains, Keywords, Snapshots)
  const filteredTopDomains = useMemo(() => {
    if (!adminData?.marketIntelligence?.topDomains) return [];
    if (!searchQuery) return adminData.marketIntelligence.topDomains;
    const q = searchQuery.toLowerCase();
    return adminData.marketIntelligence.topDomains.filter((d) =>
      d.domain.toLowerCase().includes(q)
    );
  }, [adminData?.marketIntelligence?.topDomains, searchQuery]);

  const filteredTopKeywords = useMemo(() => {
    if (!adminData?.marketIntelligence?.topKeywords) return [];
    if (!searchQuery) return adminData.marketIntelligence.topKeywords;
    const q = searchQuery.toLowerCase();
    return adminData.marketIntelligence.topKeywords.filter((k) =>
      k.keyword.toLowerCase().includes(q)
    );
  }, [adminData?.marketIntelligence?.topKeywords, searchQuery]);

  const filteredSnapshots = useMemo(() => {
    if (!adminData?.marketIntelligence?.recentSnapshots) return [];
    if (!searchQuery) return adminData.marketIntelligence.recentSnapshots;
    const q = searchQuery.toLowerCase();
    return adminData.marketIntelligence.recentSnapshots.filter((s) =>
      s.url.toLowerCase().includes(q) ||
      (s.label && s.label.toLowerCase().includes(q)) ||
      (s.target_keyword && s.target_keyword.toLowerCase().includes(q)) ||
      (s.user_email && s.user_email.toLowerCase().includes(q))
    );
  }, [adminData?.marketIntelligence?.recentSnapshots, searchQuery]);

  // Quick Export to CSV
  const exportUsersToCsv = () => {
    if (!adminData?.usersList || adminData.usersList.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Provider', 'Role', 'Status', 'DailyLimit', 'DailyUsed', 'CreatedAt'];
    const rows = adminData.usersList.map((u) => [
      u.id,
      `"${u.name || ''}"`,
      u.email,
      u.provider,
      u.role || 'user',
      u.status || 'active',
      u.daily_ai_credits_limit,
      u.daily_ai_credits_used,
      new Date(u.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analyzeserp_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-emerald-950 dark:text-emerald-100 border border-emerald-500/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs font-medium">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-2">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Admin Management Hub • Live Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              AnalyzeSERP <span className="text-emerald-600 dark:text-emerald-400">Command Console</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time user accounts, credit allocation, visual engine metrics, and user feedback.
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={exportUsersToCsv}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export registered users to CSV"
              >
                <Download className="size-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => fetchAdminData(adminKey)}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Live</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
              >
                Lock Panel
              </button>
            </div>
          )}
        </div>

        {/* Authentication Login Screen */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto py-12">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl space-y-6 text-center">
              <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Key className="size-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Authentication</h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  Enter your Secret Admin Passkey (`ADMIN_SECRET_KEY`) to manage registered accounts and access telemetry.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  required
                  placeholder="Enter Secret Admin Passkey"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-center font-mono focus:outline-none"
                />

                {errorMsg && (
                  <div className="text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Verifying Admin Key...' : 'Unlock Management Panel'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          adminData && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Registered Accounts */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Registered Users
                    </span>
                    <Users className="size-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                      {adminData.summary.totalRegisteredUsers || 0}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {adminData.summary.proUsersCount || 0} Pro
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>{adminData.summary.activeUsersCount || 0} Active • {adminData.summary.suspendedUsersCount || 0} Suspended</span>
                  </div>
                </div>

                {/* Metric 2: Tool Executions */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Total Tool Runs
                    </span>
                    <Activity className="size-4 text-cyan-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                      {adminData.summary.totalAuditsRun}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      ({adminData.summary.totalVisitors} unique)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    <TrendingUp className="size-3 text-cyan-500" />
                    <span>All 21 SEO engines online</span>
                  </div>
                </div>

                {/* Metric 3: Top Tool */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Top Engagement
                    </span>
                    <Zap className="size-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                    {adminData.summary.topTool}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    <Sparkles className="size-3 text-indigo-500" />
                    <span>Highest session density</span>
                  </div>
                </div>

                {/* Metric 4: User Rating */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      User Satisfaction
                    </span>
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono flex items-center gap-1.5">
                    <span>{adminData.summary.avgRating}</span>
                    <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    <span>{adminData.summary.totalReviews} verified community ratings</span>
                  </div>
                </div>
              </div>

              {/* VISUAL CHARTS SECTION (Interactive Bar & Donut & Activity) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart 1: Tool Execution Distribution (Bar Chart) */}
                <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <BarChart3 className="size-4 text-emerald-500" />
                        <span>Tool Usage Breakdown &amp; Demand</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Execution counts and traffic share per SEO diagnostic engine
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {adminData.summary.totalAuditsRun} Total Runs
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {adminData.charts.toolBreakdownChart.slice(0, 6).map((item, idx) => {
                      const colors = [
                        'bg-emerald-500',
                        'bg-teal-500',
                        'bg-cyan-500',
                        'bg-indigo-500',
                        'bg-violet-500',
                        'bg-slate-400',
                      ];
                      const barColor = colors[idx % colors.length];

                      return (
                        <div key={item.tool} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{item.tool}</span>
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="font-bold text-slate-900 dark:text-white">{item.count} runs</span>
                              <span className="text-slate-400 w-10 text-right">({item.percentage}%)</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(4, item.percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {adminData.charts.toolBreakdownChart.length === 0 && (
                      <p className="text-xs text-slate-400 py-6 text-center">No tool runs logged yet.</p>
                    )}
                  </div>
                </div>

                {/* Chart 2: User Subscription Tier & Status (SVG Donut Chart) */}
                <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <PieChartIcon className="size-4 text-cyan-500" />
                        <span>Member Tiers &amp; Account Health</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Free vs Pro ratio and account security status
                      </p>
                    </div>
                  </div>

                  {/* SVG Donut Visual */}
                  <div className="flex items-center justify-center gap-6 py-2">
                    <div className="relative size-32 shrink-0">
                      {/* Responsive Circular Donut */}
                      {(() => {
                        const total = Math.max(1, adminData.summary.totalRegisteredUsers);
                        const proPercent = Math.round(((adminData.summary.proUsersCount || 0) / total) * 100);
                        const freePercent = 100 - proPercent;
                        const circumference = 2 * Math.PI * 40;
                        const proOffset = (proPercent / 100) * circumference;

                        return (
                          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                            {/* Background Track (Free Users) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="text-slate-200 dark:text-white/10 stroke-current"
                              strokeWidth="12"
                              fill="transparent"
                            />
                            {/* Pro Members Track */}
                            {proPercent > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                className="text-emerald-500 stroke-current transition-all duration-700"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - proOffset}
                                strokeLinecap="round"
                                fill="transparent"
                              />
                            )}
                          </svg>
                        );
                      })()}

                      {/* Center Stats */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                          {adminData.summary.totalRegisteredUsers}
                        </span>
                        <span className="text-[9px] uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                          Users
                        </span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {adminData.summary.proUsersCount || 0} Pro Members
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {Math.round(((adminData.summary.proUsersCount || 0) / Math.max(1, adminData.summary.totalRegisteredUsers)) * 100)}% of total
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {adminData.summary.freeUsersCount || 0} Free Users
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">Default 5 AI credits/day</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Health Status Pills */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-[10px] uppercase font-mono font-bold text-emerald-700 dark:text-emerald-400">Active Accounts</div>
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-300 font-mono">
                        {adminData.summary.activeUsersCount || 0}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div className="text-[10px] uppercase font-mono font-bold text-rose-700 dark:text-rose-400">Suspended</div>
                      <div className="text-base font-extrabold text-rose-600 dark:text-rose-300 font-mono">
                        {adminData.summary.suspendedUsersCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'users'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Users className="size-3.5" />
                    <span>Registered Users ({adminData.usersList?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('market')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'market'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Globe className="size-3.5" />
                    <span>Market Trends &amp; Competitors ({adminData.marketIntelligence?.topDomains?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('usage')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'usage'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Activity className="size-3.5" />
                    <span>Tool Activity Logs ({adminData.userTable?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('feedback')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'feedback'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="size-3.5" />
                    <span>Community Reviews ({adminData.feedbackTable?.length || 0})</span>
                  </button>
                </div>

                {/* Universal Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, email, IP, or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* TAB 1: REGISTERED USERS & CREDITS CONTROL (FOCAL TAB) */}
              {activeTab === 'users' && (
                <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                  {/* Table Header & Role Filter Chips */}
                  <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users className="size-4 text-emerald-500" />
                        <span>Registered User Accounts &amp; Credit Allocation Control</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage daily AI quotas, upgrade accounts to Pro tier, or toggle suspension states.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                        <Filter className="size-3" /> Filter:
                      </span>
                      {(['all', 'pro', 'free', 'suspended'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setUserRoleFilter(filterKey)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold capitalize transition-all cursor-pointer ${
                            userRoleFilter === filterKey
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {filterKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-3">User Profile</th>
                          <th className="px-6 py-3">Auth Provider</th>
                          <th className="px-6 py-3">Plan Tier</th>
                          <th className="px-6 py-3">Daily AI Quota</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Quick Credit Boost</th>
                          <th className="px-6 py-3">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => {
                            const isBusy = actionInProgressEmail === user.email;
                            const isPro = user.role === 'pro';
                            const isSuspended = user.status === 'suspended';
                            const quotaLimit = user.daily_ai_credits_limit || 5;
                            const quotaUsed = user.daily_ai_credits_used || 0;
                            const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

                            return (
                              <tr key={user.email} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                {/* Profile */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {user.image ? (
                                      <img
                                        src={user.image}
                                        alt={user.name || 'User Avatar'}
                                        className="size-8 rounded-full border border-slate-200 dark:border-white/10 shrink-0 object-cover"
                                      />
                                    ) : (
                                      <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                                        {(user.name || user.email)[0].toUpperCase()}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[160px]">
                                        {user.name || 'Anonymous User'}
                                      </div>
                                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Auth Provider */}
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                    {user.provider}
                                  </span>
                                </td>

                                {/* Plan Tier & 1-Click Pro Toggle */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                                        isPro
                                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                                      }`}
                                    >
                                      {isPro && <Crown className="size-3 text-amber-500" />}
                                      <span>{user.role?.toUpperCase() || 'USER'}</span>
                                    </span>

                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() =>
                                        executeUserAction(user.email, 'TOGGLE_ROLE', isPro ? 'user' : 'pro')
                                      }
                                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                                      title={isPro ? 'Downgrade to Free tier' : 'Grant Pro subscription tier'}
                                    >
                                      {isPro ? 'Demote' : 'Make Pro'}
                                    </button>
                                  </div>
                                </td>

                                {/* Daily AI Quota */}
                                <td className="px-6 py-4">
                                  <div className="space-y-1 w-32">
                                    <div className="flex items-center justify-between text-[11px] font-mono">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {quotaUsed} / {quotaLimit}
                                      </span>
                                      <span className="text-[10px] text-slate-400">{quotaLimit - quotaUsed} left</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          quotaPercent >= 100
                                            ? 'bg-rose-500'
                                            : quotaPercent > 70
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${quotaPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Account Status Toggle */}
                                <td className="px-6 py-4">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      executeUserAction(user.email, 'TOGGLE_STATUS', isSuspended ? 'active' : 'suspended')
                                    }
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                      isSuspended
                                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                    }`}
                                    title={isSuspended ? 'Reactivate account' : 'Suspend account'}
                                  >
                                    <span className={`size-1.5 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    <span>{user.status || 'ACTIVE'}</span>
                                  </button>
                                </td>

                                {/* Quick Credit Boost Buttons */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => executeUserAction(user.email, 'ADD_BONUS_CREDITS', 10)}
                                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                      title="Add +10 AI Credits to daily limit"
                                    >
                                      +10
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => executeUserAction(user.email, 'ADD_BONUS_CREDITS', 50)}
                                      className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px] border border-indigo-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                      title="Add +50 AI Credits to daily limit"
                                    >
                                      +50
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => executeUserAction(user.email, 'RESET_USAGE')}
                                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                                      title="Reset today's used credits to 0"
                                    >
                                      <RotateCcw className="size-3" />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => {
                                        const promptVal = prompt(
                                          `Enter new daily AI credit limit for ${user.email}:`,
                                          String(quotaLimit)
                                        );
                                        if (promptVal !== null) {
                                          const num = Number(promptVal);
                                          if (!isNaN(num) && num >= 0) {
                                            executeUserAction(user.email, 'ADJUST_CREDITS', num);
                                          }
                                        }
                                      }}
                                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                                      title="Set custom daily limit"
                                    >
                                      <SlidersHorizontal className="size-3" />
                                    </button>
                                  </div>
                                </td>

                                {/* Joined Date */}
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                              No registered users match your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: MARKET TRENDS & COMPETITOR INTELLIGENCE */}
              {activeTab === 'market' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Market Overview 4-KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1: Unique Rival Domains */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Competitor Domains
                        </span>
                        <Globe className="size-4 text-emerald-500" />
                      </div>
                      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                        {adminData.marketIntelligence?.uniqueDomainsCount ?? 0}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Tracked across user audits</span>
                      </div>
                    </div>

                    {/* KPI 2: Top Audited Rival */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Top Rival Target
                        </span>
                        <Target className="size-4 text-cyan-500" />
                      </div>
                      <div
                        className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-mono truncate"
                        title={adminData.marketIntelligence?.topDomains?.[0]?.domain || 'N/A'}
                      >
                        {adminData.marketIntelligence?.topDomains?.[0]?.domain || 'None yet'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                          {adminData.marketIntelligence?.topDomains?.[0]?.count || 0} total audits
                        </span>
                      </div>
                    </div>

                    {/* KPI 3: Unique Keyword Niches */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Focus Keywords
                        </span>
                        <Layers className="size-4 text-indigo-500" />
                      </div>
                      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                        {adminData.marketIntelligence?.uniqueKeywordsCount ?? 0}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        <Sparkles className="size-3 text-indigo-500" />
                        <span>Active target niches</span>
                      </div>
                    </div>

                    {/* KPI 4: Platform Average Audit Score */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Platform Avg Score
                        </span>
                        <TrendingUp className="size-4 text-amber-500" />
                      </div>
                      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono flex items-baseline gap-1">
                        <span>{adminData.marketIntelligence?.platformAvgScore ?? 0}</span>
                        <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        <span>Based on snapshot benchmarks</span>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Visual Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Chart A: Top Audited Competitor Domains Bar Chart */}
                    <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Globe className="size-4 text-emerald-500" />
                            <span>Top Audited Competitor Domains</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Most frequently benchmarked rival websites across all audits
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Top {filteredTopDomains.length}
                        </span>
                      </div>

                      <div className="space-y-3 pt-2">
                        {filteredTopDomains.map((item, idx) => (
                          <div key={item.domain} className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 text-center font-mono text-[10px] font-bold text-slate-400">
                                  #{idx + 1}
                                </span>
                                <a
                                  href={`https://${item.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-[200px] sm:max-w-xs flex items-center gap-1"
                                >
                                  <span>{item.domain}</span>
                                  <ExternalLink className="size-3 text-slate-400 hover:text-emerald-500 shrink-0" />
                                </a>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                                <span className="font-bold text-slate-900 dark:text-white">{item.count} audits</span>
                                <span className="text-slate-400 w-10 text-right">({item.percentage}%)</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(4, item.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}

                        {filteredTopDomains.length === 0 && (
                          <p className="text-xs text-slate-400 py-8 text-center">No competitor domains recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Chart B: SEO Score Distribution Bracket Chart */}
                    <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <BarChart3 className="size-4 text-cyan-500" />
                          <span>SEO Score Distribution Brackets</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Audit benchmark health distribution across snapshots
                        </p>
                      </div>

                      <div className="space-y-4 py-2">
                        {adminData.marketIntelligence?.scoreDistribution?.map((bracket) => (
                          <div key={bracket.range} className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="size-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: bracket.color }}
                                />
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {bracket.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ({bracket.range})
                                </span>
                              </div>
                              <div className="font-mono text-[11px] flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">{bracket.count}</span>
                                <span className="text-slate-400">({bracket.percentage}%)</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(bracket.count > 0 ? 5 : 0, bracket.percentage)}%`,
                                  backgroundColor: bracket.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          Platform Benchmark Parity
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {adminData.marketIntelligence?.platformAvgScore || 0} / 100 AVG
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Focus Keywords Matrix */}
                  <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                    <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Target className="size-4 text-indigo-500" />
                          <span>Top Focus Keywords Matrix</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Keywords targeted by users in audit snapshots with average benchmark scores
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Keyword Query</th>
                            <th className="px-6 py-3">Audits Run</th>
                            <th className="px-6 py-3">Avg SEO Score</th>
                            <th className="px-6 py-3">Last Active</th>
                            <th className="px-6 py-3 text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                          {filteredTopKeywords.length > 0 ? (
                            filteredTopKeywords.map((item) => (
                              <tr key={item.keyword} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                                  {item.keyword}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                    {item.count} audits
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                                      item.avgScore >= 85
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                        : item.avgScore >= 70
                                        ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                                        : item.avgScore >= 50
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {item.avgScore} / 100
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                  {new Date(item.lastUsedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Link
                                    href={`/audit?keyword=${encodeURIComponent(item.keyword)}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[11px] font-medium transition-all"
                                  >
                                    <span>Audit Keyword</span>
                                    <ArrowUpRight className="size-3 text-slate-400" />
                                  </Link>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                No focus keywords found in audit snapshots.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 4: Platform-wide Snapshots Live Stream */}
                  <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                    <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Activity className="size-4 text-emerald-500" />
                          <span>Platform-wide Audit Snapshots Live Stream</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Recent competitive audit snapshots saved across the platform with 1-click `/audit` launcher
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Showing recent {filteredSnapshots.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Snapshot Target</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3">Keyword &amp; Label</th>
                            <th className="px-6 py-3">Auditor Email</th>
                            <th className="px-6 py-3">Created</th>
                            <th className="px-6 py-3 text-right">Inspect Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                          {filteredSnapshots.length > 0 ? (
                            filteredSnapshots.map((snap) => (
                              <tr key={snap.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                                    <a
                                      href={snap.url.startsWith('http') ? snap.url : `https://${snap.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 truncate flex items-center gap-1"
                                    >
                                      <span className="truncate">{snap.url}</span>
                                      <ExternalLink className="size-3 text-slate-400 shrink-0" />
                                    </a>
                                  </div>
                                </td>

                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                      snap.score >= 85
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                        : snap.score >= 70
                                        ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                                        : snap.score >= 50
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {snap.score} / 100
                                  </span>
                                </td>

                                <td className="px-6 py-4">
                                  <div className="space-y-0.5">
                                    <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                                      {snap.target_keyword || <span className="text-slate-400 italic">No keyword</span>}
                                    </div>
                                    {snap.label && (
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                                        {snap.label}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                                  {snap.user_email}
                                </td>

                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                  {new Date(snap.created_at).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4 text-right">
                                  <Link
                                    href={`/audit?snapshotId=${snap.id}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-all"
                                  >
                                    <span>Open in /audit</span>
                                    <ArrowUpRight className="size-3 text-emerald-500" />
                                  </Link>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                No audit snapshots found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER SESSION TOOL ACTIVITY TABLE */}
              {activeTab === 'usage' && (
                <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                  <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Activity className="size-4 text-cyan-500" />
                        <span>Live Session Activity &amp; Tool Executions</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Track tool executions by IP address, target URLs, and frequency
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Visitor IP / Session</th>
                          <th className="px-6 py-3">Total Uses</th>
                          <th className="px-6 py-3">Tool Breakdown</th>
                          <th className="px-6 py-3">Recent Target URL</th>
                          <th className="px-6 py-3">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 font-mono">
                        {filteredUserTable.length > 0 ? (
                          filteredUserTable.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                {row.ip}
                              </td>
                              <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-100">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                                  {row.totalUses} runs
                                </span>
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                {Object.entries(row.toolBreakdown).map(([tool, count]) => (
                                  <span
                                    key={tool}
                                    className="inline-block mr-2 mb-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 font-sans border border-slate-200 dark:border-white/10"
                                  >
                                    <strong>{tool}</strong>: {count}x
                                  </span>
                                ))}
                              </td>
                              <td className="px-6 py-4 max-w-xs truncate text-slate-600 dark:text-gray-300 font-sans">
                                {row.urls[0] ? (
                                  <a
                                    href={row.urls[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline text-cyan-600 dark:text-cyan-400 flex items-center gap-1"
                                  >
                                    <span className="truncate">{row.urls[0]}</span>
                                    <ExternalLink className="size-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-gray-400 text-[11px] font-sans whitespace-nowrap">
                                {new Date(row.lastUsedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400 font-sans">
                              No activity records match your search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: USER REVIEWS & SUGGESTIONS TABLE */}
              {activeTab === 'feedback' && (
                <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                  <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquare className="size-4 text-indigo-500" />
                        <span>Community Feedback &amp; Feature Suggestions</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ratings and ideas submitted via the in-app feedback trigger
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Rating</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">User Role</th>
                          <th className="px-6 py-3">Message / Feature Idea</th>
                          <th className="px-6 py-3">Email Contact</th>
                          <th className="px-6 py-3">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                        {filteredFeedbackTable.length > 0 ? (
                          filteredFeedbackTable.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                                  <span>{row.rating}</span>
                                  <Star className="size-3.5 fill-amber-400" />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-mono">
                                  {row.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-700 dark:text-gray-300">
                                {row.user_type}
                              </td>
                              <td className="px-6 py-4 text-slate-800 dark:text-gray-200 max-w-md whitespace-pre-line leading-relaxed">
                                {row.message}
                              </td>
                              <td className="px-6 py-4 font-mono text-cyan-600 dark:text-cyan-400">
                                {row.email ? (
                                  <a href={`mailto:${row.email}`} className="hover:underline">
                                    {row.email}
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic">None provided</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-gray-400 text-[11px] whitespace-nowrap">
                                {new Date(row.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">
                              No feedback submissions match your search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
