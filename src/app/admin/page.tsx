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
  ShieldAlert,
  Server,
  Cpu,
  Ban,
  AlertTriangle,
  Radio,
  Clock,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  Save,
  Eye,
  EyeOff,
  Settings2,
  Wrench,
  Bot,
  Flame,
  Menu,
  X,
  LogOut,
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

export interface DbSecurityIncident {
  id: number;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  target_endpoint: string | null;
  details: string | null;
  created_at: string | Date;
}

export interface DbBannedIp {
  id: number;
  ip_address: string;
  reason: string;
  banned_by: string;
  created_at: string | Date;
}

export interface SystemHealthData {
  status: 'healthy' | 'degraded';
  dbConnected: boolean;
  dbPingMs: number;
  uptimeSeconds: number;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  services: {
    geminiConfigured: boolean;
    pagespeedConfigured: boolean;
    authConfigured: boolean;
    adminKeyConfigured: boolean;
  };
  bannedIpsCount: number;
  incidents24hCount: number;
}

interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  level: 'banner_only' | 'strict_lock';
  expectedCompletion: string;
}

interface AnnouncementBannerConfig {
  enabled: boolean;
  badge: string;
  text: string;
  linkText: string;
  linkUrl: string;
  variant: 'info' | 'promotion' | 'warning' | 'success';
  dismissable: boolean;
}

interface CreditLimitsConfig {
  freeUserDailyCredits: number;
  proUserDailyCredits: number;
}

interface SiteConfigurations {
  maintenance: MaintenanceConfig;
  announcement: AnnouncementBannerConfig;
  credits: CreditLimitsConfig;
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
  systemHealth?: SystemHealthData;
  securityIncidents?: DbSecurityIncident[];
  bannedIps?: DbBannedIp[];
  usersList: DbUser[];
  userTable: UserUsageRow[];
  feedbackTable: FeedbackRow[];
  siteConfig?: SiteConfigurations;
  suspiciousBots?: SuspiciousBotInfo[];
}

export interface SuspiciousBotInfo {
  ip: string;
  callsLastMinute: number;
  peakCount: number;
  severity: 'high' | 'critical';
  details: string;
  detectedAt: string | Date;
  lastSeenAt: string | Date;
  isBanned: boolean;
  status: 'active_flood' | 'quarantined' | 'banned';
}

export type AdminTab = 'overview' | 'users' | 'market' | 'security' | 'controls' | 'usage' | 'feedback';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'pro' | 'free' | 'suspended'>('all');
  const [selectedToolFilter, setSelectedToolFilter] = useState('All');
  const [actionInProgressEmail, setActionInProgressEmail] = useState<string | null>(null);

  // Security & Blacklist Form State
  const [newBanIp, setNewBanIp] = useState('');
  const [newBanReason, setNewBanReason] = useState('');
  const [isBanningIp, setIsBanningIp] = useState(false);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // Live Site Controls State
  const [liveConfig, setLiveConfig] = useState<SiteConfigurations>({
    maintenance: { enabled: false, title: 'Scheduled Platform Maintenance', message: '', level: 'banner_only', expectedCompletion: '' },
    announcement: { enabled: true, badge: 'Public Beta', text: '', linkText: 'Start Free Audit', linkUrl: '/audit', variant: 'info', dismissable: true },
    credits: { freeUserDailyCredits: 5, proUserDailyCredits: 50 },
  });
  const [applyToExistingFreeUsers, setApplyToExistingFreeUsers] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

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
      if (data.siteConfig) {
        setLiveConfig(data.siteConfig);
      }
      setIsAuthenticated(true);
      localStorage.setItem('analyze_admin_key', keyToUse);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while loading admin panel.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Live Site Config
  const handleSaveSiteConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ action: 'UPDATE_SITE_CONFIG', siteConfig: liveConfig, applyToExistingFreeUsers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save site config.');
      showToast('Live site configuration saved successfully.');
      if (data.siteConfig) {
        setLiveConfig(data.siteConfig);
        setAdminData((prev) => prev ? { ...prev, siteConfig: data.siteConfig } : null);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
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

  // Filter Security Incidents
  const filteredSecurityIncidents = useMemo(() => {
    if (!adminData?.securityIncidents) return [];
    return adminData.securityIncidents.filter((inc) => {
      if (selectedSeverityFilter !== 'all' && inc.severity !== selectedSeverityFilter) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        inc.ip_address.toLowerCase().includes(q) ||
        inc.incident_type.toLowerCase().includes(q) ||
        (inc.target_endpoint && inc.target_endpoint.toLowerCase().includes(q)) ||
        (inc.details && inc.details.toLowerCase().includes(q))
      );
    });
  }, [adminData?.securityIncidents, selectedSeverityFilter, searchQuery]);

  // Filter Banned IPs
  const filteredBannedIps = useMemo(() => {
    if (!adminData?.bannedIps) return [];
    if (!searchQuery) return adminData.bannedIps;
    const q = searchQuery.toLowerCase();
    return adminData.bannedIps.filter((b) =>
      b.ip_address.toLowerCase().includes(q) ||
      b.reason.toLowerCase().includes(q) ||
      b.banned_by.toLowerCase().includes(q)
    );
  }, [adminData?.bannedIps, searchQuery]);

  // Filter Suspicious Bots
  const filteredSuspiciousBots = useMemo(() => {
    if (!adminData?.suspiciousBots) return [];
    if (!searchQuery) return adminData.suspiciousBots;
    const q = searchQuery.toLowerCase();
    return adminData.suspiciousBots.filter((b) =>
      b.ip.toLowerCase().includes(q) ||
      b.details.toLowerCase().includes(q) ||
      b.severity.toLowerCase().includes(q)
    );
  }, [adminData?.suspiciousBots, searchQuery]);

  // Execute Ban IP
  const handleBanIp = async (ipToBan: string, reasonToBan: string) => {
    if (!ipToBan || !ipToBan.trim()) return;
    setIsBanningIp(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'BAN_IP',
          ip: ipToBan.trim(),
          reason: reasonToBan.trim() || 'Manual Admin Ban',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to ban IP');
      showToast(data.message || `IP ${ipToBan} has been added to blacklist.`);
      setNewBanIp('');
      setNewBanReason('');
      if (adminData && data.bannedIps) {
        setAdminData((prev) => {
          if (!prev) return null;
          const updatedBots = prev.suspiciousBots?.map((bot) =>
            bot.ip === ipToBan.trim() ? { ...bot, isBanned: true, status: 'banned' as const } : bot
          );
          return {
            ...prev,
            bannedIps: data.bannedIps,
            suspiciousBots: updatedBots,
          };
        });
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsBanningIp(false);
    }
  };

  // Execute Unban IP
  const handleUnbanIp = async (ipToUnban: string) => {
    if (!confirm(`Are you sure you want to lift the blacklist ban on ${ipToUnban}?`)) return;
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          action: 'UNBAN_IP',
          ip: ipToUnban,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unban IP');
      showToast(data.message || `IP ${ipToUnban} unbanned.`);
      if (adminData && data.bannedIps) {
        setAdminData((prev) => {
          if (!prev) return null;
          const updatedBots = prev.suspiciousBots?.map((bot) =>
            bot.ip === ipToUnban ? { ...bot, isBanned: false, status: 'quarantined' as const } : bot
          );
          return {
            ...prev,
            bannedIps: data.bannedIps,
            suspiciousBots: updatedBots,
          };
        });
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

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

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <div className="flex flex-col md:flex-row items-start gap-6 animate-in fade-in duration-300">
              {/* === LEFT SIDEBAR NAVIGATION === */}
              <aside
                className={`
                  fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-200/80 dark:border-white/10 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:rounded-2xl md:border md:w-60 md:shrink-0
                  ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl bg-white dark:bg-slate-950' : '-translate-x-full md:translate-x-0'}
                `}
              >
                <div>
                  {/* Mobile Drawer Header */}
                  <div className="flex items-center justify-between pb-3 md:hidden border-b border-slate-200/80 dark:border-white/10 mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">Console Menu</span>
                    <button
                      type="button"
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      aria-label="Close menu"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Sidebar Navigation Links */}
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Console Navigation
                    </div>

                    {[
                      { id: 'overview' as const, label: 'Overview', icon: BarChart3, badge: null, badgeVariant: 'normal' },
                      { id: 'users' as const, label: 'Users', icon: Users, badge: adminData.summary.totalRegisteredUsers, badgeVariant: 'normal' },
                      { id: 'market' as const, label: 'Market Trends', icon: Globe, badge: adminData.marketIntelligence?.topDomains?.length || 0, badgeVariant: 'normal' },
                      {
                        id: 'security' as const,
                        label: 'Security & Bots',
                        icon: ShieldAlert,
                        badge: (adminData.suspiciousBots?.length || 0) > 0 ? `${adminData.suspiciousBots?.length} Alert` : adminData.bannedIps?.length || null,
                        badgeVariant: (adminData.suspiciousBots?.length || 0) > 0 ? 'alert' : 'normal',
                      },
                      { id: 'controls' as const, label: 'Site Controls', icon: Settings2, badge: null, badgeVariant: 'normal' },
                      { id: 'usage' as const, label: 'Tool Logs', icon: Activity, badge: adminData.userTable?.length || 0, badgeVariant: 'normal' },
                      { id: 'feedback' as const, label: 'Reviews', icon: MessageSquare, badge: adminData.feedbackTable?.length || 0, badgeVariant: 'normal' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge !== null && item.badge !== undefined && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeVariant === 'alert'
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Footer System Health */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 mt-6 space-y-3">
                  <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Database</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {adminData.systemHealth?.dbPingMs ?? -1} ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Status</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {adminData.systemHealth?.status === 'healthy' ? 'Operational' : 'Degraded'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Lock Panel</span>
                  </button>
                </div>
              </aside>

              {/* Mobile Drawer Backdrop */}
              {isMobileSidebarOpen && (
                <div
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
                />
              )}

              {/* === RIGHT MAIN CONTENT AREA === */}
              <div className="flex-1 min-w-0 space-y-6 w-full">
                {/* Content Header & Universal Search */}
                <div className="glass-panel p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 md:hidden hover:bg-slate-100 dark:hover:bg-white/5"
                      aria-label="Open navigation sidebar"
                    >
                      <Menu className="size-4 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {activeTab === 'overview' && 'Executive Analytics & Engine Breakdown'}
                        {activeTab === 'users' && `Registered Users Directory (${adminData.usersList?.length || 0})`}
                        {activeTab === 'market' && `Competitor Intelligence & Search Trends (${adminData.marketIntelligence?.topDomains?.length || 0})`}
                        {activeTab === 'security' && `System Health & Threat Radar (${adminData.securityIncidents?.length || 0})`}
                        {activeTab === 'controls' && 'Live Site Controls & Announcements'}
                        {activeTab === 'usage' && `Tool Activity & Session Logs (${adminData.userTable?.length || 0})`}
                        {activeTab === 'feedback' && `Community Reviews & Suggestions (${adminData.feedbackTable?.length || 0})`}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeTab === 'overview' && 'Real-time performance metrics, tool breakdown, and tier distribution'}
                        {activeTab === 'users' && 'Manage user permissions, daily AI quotas, and account status'}
                        {activeTab === 'market' && 'Domain analysis trends, top keywords, and recent audit snapshots'}
                        {activeTab === 'security' && 'Infrastructure diagnostics, suspicious bot radar, and IP blacklist'}
                        {activeTab === 'controls' && 'Live maintenance alert, top banner, and default credits controller'}
                        {activeTab === 'usage' && 'Audit sessions, client IPs, and tool invocation history'}
                        {activeTab === 'feedback' && 'Community ratings, feedback submissions, and bug reports'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Search Input */}
                    {activeTab !== 'controls' && (
                      <div className="relative w-full sm:w-64">
                        <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search IP, name, email, URL..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-7 py-1.5 rounded-xl glass-input text-xs focus:outline-none font-mono"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}

                    {activeTab === 'users' && (
                      <button
                        type="button"
                        onClick={exportUsersToCsv}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Export registered users to CSV"
                      >
                        <Download className="size-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Export CSV</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => fetchAdminData(adminKey)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                      title="Refresh live data"
                    >
                      <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                </div>

                {/* TAB 0: OVERVIEW (KPIs + Charts + Health Ring) */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
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
            </div>
          )}

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

              {/* TAB: SYSTEM HEALTH & SECURITY TELEMETRY */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Security & Health Overview 4-KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1: Operational Status */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          System Status
                        </span>
                        <Radio className="size-4 text-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2.5 rounded-full ${
                            adminData.systemHealth?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono uppercase">
                          {adminData.systemHealth?.status === 'healthy' ? 'Healthy' : 'Degraded'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        <span>Database &amp; APIs responding</span>
                      </div>
                    </div>

                    {/* KPI 2: Active IP Blacklists */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Active IP Bans
                        </span>
                        <Ban className="size-4 text-rose-500" />
                      </div>
                      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                        {adminData.bannedIps?.length ?? 0}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        <span>Blocked from crawler &amp; API</span>
                      </div>
                    </div>

                    {/* KPI 3: 24h Security Incidents */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          24h Security Events
                        </span>
                        <ShieldAlert className="size-4 text-amber-500" />
                      </div>
                      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                        {adminData.systemHealth?.incidents24hCount ?? 0}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        {adminData.suspiciousBots && adminData.suspiciousBots.length > 0 ? (
                          <span className="text-rose-500 font-bold flex items-center gap-1">
                            <Bot className="size-3" /> {adminData.suspiciousBots.length} bot flood{adminData.suspiciousBots.length > 1 ? 's' : ''} detected
                          </span>
                        ) : (
                          <span>Rate limits, SSRF &amp; bot radar</span>
                        )}
                      </div>
                    </div>

                    {/* KPI 4: Server Runtime & Memory */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Server Uptime &amp; Heap
                        </span>
                        <Cpu className="size-4 text-cyan-500" />
                      </div>
                      <div className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
                        {(() => {
                          const s = adminData.systemHealth?.uptimeSeconds || 0;
                          const h = Math.floor(s / 3600);
                          const m = Math.floor((s % 3600) / 60);
                          return `${h}h ${m}m uptime`;
                        })()}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5 font-mono">
                        <span>Heap: {adminData.systemHealth?.memory.heapUsedMB || 0} MB / {adminData.systemHealth?.memory.heapTotalMB || 0} MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Connectivity & Environment Health Matrix */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Server className="size-4 text-emerald-500" />
                        <span>Core Service Connectivity &amp; Infrastructure Matrix</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Live connectivity status, latency benchmarks, and cloud credentials audit
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                      {/* Service 1: MySQL Database */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">MySQL Database</span>
                          <span
                            className={`size-2 rounded-full ${
                              adminData.systemHealth?.dbConnected ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {adminData.systemHealth?.dbConnected ? 'Pool Connected' : 'Memory Fallback'}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          Ping: {adminData.systemHealth?.dbPingMs ?? -1} ms
                        </div>
                      </div>

                      {/* Service 2: Gemini 2.5 Flash */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gemini 2.5 Flash</span>
                          <span
                            className={`size-2 rounded-full ${
                              adminData.systemHealth?.services.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          AI Diagnostics Engine
                        </div>
                        <div
                          className={`text-[11px] font-mono font-bold ${
                            adminData.systemHealth?.services.geminiConfigured
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {adminData.systemHealth?.services.geminiConfigured ? 'API Key Active' : 'Key Unset'}
                        </div>
                      </div>

                      {/* Service 3: PageSpeed Insights */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">PageSpeed Insights</span>
                          <span
                            className={`size-2 rounded-full ${
                              adminData.systemHealth?.services.pagespeedConfigured ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          CWV &amp; Performance Audit
                        </div>
                        <div
                          className={`text-[11px] font-mono font-bold ${
                            adminData.systemHealth?.services.pagespeedConfigured
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {adminData.systemHealth?.services.pagespeedConfigured ? 'Configured' : 'Optional (Free Tier)'}
                        </div>
                      </div>

                      {/* Service 4: Auth & Admin Guard */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Auth &amp; Secrets</span>
                          <span
                            className={`size-2 rounded-full ${
                              adminData.systemHealth?.services.authConfigured &&
                              adminData.systemHealth?.services.adminKeyConfigured
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          OAuth &amp; Timing-Safe Passkey
                        </div>
                        <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Locked &amp; Enforced
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Suspicious Bot & Automated Scraper Threat Radar (50+ Calls/Min) */}
                  <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                    <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Bot className="size-4 text-rose-500" />
                          <span>Suspicious Bot &amp; Automated Scraper Radar</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Threshold: 50+ calls/min
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Real-time velocity detector for bots and scrapers attempting to drain server bandwidth and crawling quotas
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {adminData.suspiciousBots && adminData.suspiciousBots.length > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
                            {adminData.suspiciousBots.length} High-Burst Threat{adminData.suspiciousBots.length > 1 ? 's' : ''} Detected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            0 Active Bot Threats (Clean)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Threat List Table or Clean State */}
                    <div className="overflow-x-auto">
                      {filteredSuspiciousBots.length > 0 ? (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            <tr>
                              <th className="px-6 py-3">Offending IP</th>
                              <th className="px-6 py-3">Burst Velocity</th>
                              <th className="px-6 py-3">Threat Classification</th>
                              <th className="px-6 py-3">Severity</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Detected At</th>
                              <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 font-mono">
                            {filteredSuspiciousBots.map((bot) => {
                              const isBanned = adminData.bannedIps?.some((b) => b.ip_address === bot.ip) || bot.isBanned;
                              return (
                                <tr key={bot.ip} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                    <Bot className="size-3.5 shrink-0" />
                                    <span>{bot.ip}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                                      <Flame className="size-3 text-rose-500" />
                                      {bot.peakCount || bot.callsLastMinute} calls / min
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-sans text-slate-700 dark:text-slate-300">
                                    {bot.details || 'Automated Tool Scraping Flood'}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                      bot.severity === 'critical'
                                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                                    }`}>
                                      {bot.severity}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {isBanned ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        <Ban className="size-3" /> Blacklisted
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        <ShieldAlert className="size-3" /> Quarantined
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    {new Date(bot.detectedAt).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-right font-sans">
                                    {isBanned ? (
                                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                        Mitigated
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNewBanIp(bot.ip);
                                          setNewBanReason(`Automated Bot Flood (${bot.peakCount || bot.callsLastMinute} calls/min)`);
                                          handleBanIp(bot.ip, `Automated Bot Flood (${bot.peakCount || bot.callsLastMinute} calls/min)`);
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                                      >
                                        <Ban className="size-3" />
                                        <span>Blacklist Bot</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-8 text-center space-y-2">
                          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="size-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Zero High-Velocity Scrapers Detected
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            No IP has exceeded the 50+ tool calls/minute flood threshold in the active window. Normal rate limiters and crawler protections are actively monitoring all requests.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: IP Blacklist & Threat Defense Manager */}
                  <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                    <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Ban className="size-4 text-rose-500" />
                          <span>Active IP Blacklist &amp; Threat Defense</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Ban abusive client IPs from all crawler execution endpoints and API routes
                        </p>
                      </div>

                      <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                        {adminData.bannedIps?.length || 0} Active Bans
                      </div>
                    </div>

                    {/* Inline Quick-Ban Form */}
                    <div className="p-4 sm:px-6 bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-200/80 dark:border-white/10">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleBanIp(newBanIp, newBanReason);
                        }}
                        className="flex flex-col sm:flex-row items-center gap-3"
                      >
                        <input
                          type="text"
                          required
                          placeholder="IP address (e.g. 192.0.2.1)"
                          value={newBanIp}
                          onChange={(e) => setNewBanIp(e.target.value)}
                          className="w-full sm:w-56 px-3 py-1.5 rounded-xl glass-input text-xs font-mono focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Reason (e.g. Excessive bot scraping flood)"
                          value={newBanReason}
                          onChange={(e) => setNewBanReason(e.target.value)}
                          className="w-full sm:flex-1 px-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isBanningIp || !newBanIp.trim()}
                          className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        >
                          <Ban className="size-3.5" />
                          <span>{isBanningIp ? 'Banning...' : 'Add IP Ban'}</span>
                        </button>
                      </form>
                    </div>

                    {/* Banned IPs Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Banned IP Address</th>
                            <th className="px-6 py-3">Ban Reason</th>
                            <th className="px-6 py-3">Banned By</th>
                            <th className="px-6 py-3">Date Applied</th>
                            <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 font-mono">
                          {filteredBannedIps.length > 0 ? (
                            filteredBannedIps.map((b) => (
                              <tr key={b.ip_address} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                  <Ban className="size-3.5 shrink-0" />
                                  <span>{b.ip_address}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-sans max-w-xs truncate">
                                  {b.reason}
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
                                  {b.banned_by}
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                                  {new Date(b.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleUnbanIp(b.ip_address)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 text-[11px] font-medium transition-all cursor-pointer font-sans"
                                  >
                                    Lift Ban
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-sans">
                                No active IP bans. All client networks are operating normally.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section: Live Security & Incident Feed */}
                  <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm space-y-4">
                    <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <ShieldAlert className="size-4 text-amber-500" />
                          <span>Live Security &amp; Incident Telemetry Feed</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Real-time stream of HTTP 429 rate limit trips, SSRF probing blocks, and auth attempts
                        </p>
                      </div>

                      {/* Severity Filters */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                          <Filter className="size-3" /> Severity:
                        </span>
                        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => setSelectedSeverityFilter(sev)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold capitalize transition-all cursor-pointer ${
                              selectedSeverityFilter === sev
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Incidents Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Severity</th>
                            <th className="px-6 py-3">Incident Type</th>
                            <th className="px-6 py-3">Client IP Address</th>
                            <th className="px-6 py-3">Target Endpoint</th>
                            <th className="px-6 py-3">Diagnostic Details</th>
                            <th className="px-6 py-3">Detected At</th>
                            <th className="px-6 py-3 text-right">Defense Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 font-mono">
                          {filteredSecurityIncidents.length > 0 ? (
                            filteredSecurityIncidents.map((inc) => {
                              const isAlreadyBanned = adminData.bannedIps?.some(
                                (b) => b.ip_address === inc.ip_address
                              );

                              return (
                                <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                  {/* Severity Pill */}
                                  <td className="px-6 py-4">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                        inc.severity === 'critical'
                                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                          : inc.severity === 'high'
                                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                          : inc.severity === 'medium'
                                          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                                      }`}
                                    >
                                      {inc.severity}
                                    </span>
                                  </td>

                                  {/* Incident Type */}
                                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                    {inc.incident_type === 'SUSPICIOUS_BOT_FLOOD' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                                        <Bot className="size-3 text-rose-500" />
                                        <span>BOT FLOOD (50+/min)</span>
                                      </span>
                                    ) : (
                                      inc.incident_type
                                    )}
                                  </td>

                                  {/* Offending IP */}
                                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    {inc.ip_address}
                                  </td>

                                  {/* Target Endpoint */}
                                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                    {inc.target_endpoint || '—'}
                                  </td>

                                  {/* Details */}
                                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-sans max-w-sm truncate">
                                    {inc.details || 'No diagnostic message'}
                                  </td>

                                  {/* Detected At */}
                                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                                    {new Date(inc.created_at).toLocaleString()}
                                  </td>

                                  {/* Action */}
                                  <td className="px-6 py-4 text-right font-sans">
                                    {isAlreadyBanned ? (
                                      <span className="text-[10px] font-mono text-rose-500 font-bold uppercase">
                                        Banned
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNewBanIp(inc.ip_address);
                                          setNewBanReason(`Banned from incident ${inc.incident_type}`);
                                          handleBanIp(inc.ip_address, `Triggered by ${inc.incident_type}`);
                                        }}
                                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold transition-all cursor-pointer"
                                        title={`Ban IP ${inc.ip_address}`}
                                      >
                                        Ban IP
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-sans">
                                No security incidents logged for current filter criteria.
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

              {/* TAB: LIVE SITE CONTROLS */}
              {activeTab === 'controls' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="glass-panel rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                        <Settings2 className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Site Controls & Announcements</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Control site behaviour in real-time — no code redeploy required. Changes take effect instantly for all visitors.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    {/* === CARD 1: MAINTENANCE MODE === */}
                    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Wrench className="size-4 text-amber-500" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Maintenance Mode</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Show a banner or lock site during updates</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLiveConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, enabled: !prev.maintenance.enabled } }))}
                          className="shrink-0 transition-colors"
                          aria-label="Toggle maintenance mode"
                        >
                          {liveConfig.maintenance.enabled
                            ? <ToggleRight className="size-8 text-amber-500" />
                            : <ToggleLeft className="size-8 text-slate-400 dark:text-slate-600" />}
                        </button>
                      </div>

                      <div className={`p-5 space-y-4 transition-opacity duration-200 ${liveConfig.maintenance.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        {/* Level Selector */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Alert Level</label>
                          <div className="flex gap-2">
                            {(['banner_only', 'strict_lock'] as const).map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setLiveConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, level } }))}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                  liveConfig.maintenance.level === level
                                    ? level === 'strict_lock'
                                      ? 'bg-rose-500 text-white border-rose-500'
                                      : 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                              >
                                {level === 'banner_only' ? 'Banner Only' : 'Strict Lock'}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                            {liveConfig.maintenance.level === 'strict_lock'
                              ? 'Strict Lock: Blocks tool usage and shows a full-page warning.'
                              : 'Banner Only: Shows a warning bar, tools remain accessible.'}
                          </p>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Notice Title</label>
                          <input
                            type="text"
                            value={liveConfig.maintenance.title}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, title: e.target.value } }))}
                            placeholder="Scheduled Platform Maintenance"
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Message Body</label>
                          <textarea
                            value={liveConfig.maintenance.message}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, message: e.target.value } }))}
                            rows={3}
                            placeholder="We are currently performing routine infrastructure optimization..."
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none resize-none"
                          />
                        </div>

                        {/* Expected Completion */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Est. Completion Time (optional)</label>
                          <input
                            type="text"
                            value={liveConfig.maintenance.expectedCompletion}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, expectedCompletion: e.target.value } }))}
                            placeholder="e.g. Today at 3:00 PM UTC"
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Preview */}
                      {liveConfig.maintenance.enabled && (
                        <div className={`mx-5 mb-5 p-3 rounded-xl border text-xs font-medium ${
                          liveConfig.maintenance.level === 'strict_lock'
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="size-3.5 shrink-0" />
                            <span className="font-bold uppercase text-[10px] tracking-wider">{liveConfig.maintenance.title || 'Notice'}</span>
                          </div>
                          <p className="leading-relaxed">{liveConfig.maintenance.message || '(No message set)'}</p>
                          {liveConfig.maintenance.expectedCompletion && (
                            <p className="mt-1 flex items-center gap-1 font-semibold">
                              <Clock className="size-3" /> Est: {liveConfig.maintenance.expectedCompletion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* === CARD 2: ANNOUNCEMENT BANNER === */}
                    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Megaphone className="size-4 text-emerald-500" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Announcement Banner</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Full-site announcement bar above navbar</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, enabled: !prev.announcement.enabled } }))}
                          className="shrink-0 transition-colors"
                          aria-label="Toggle announcement banner"
                        >
                          {liveConfig.announcement.enabled
                            ? <ToggleRight className="size-8 text-emerald-500" />
                            : <ToggleLeft className="size-8 text-slate-400 dark:text-slate-600" />}
                        </button>
                      </div>

                      <div className={`p-5 space-y-4 transition-opacity duration-200 ${liveConfig.announcement.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        {/* Variant */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Color Variant</label>
                          <div className="flex gap-2 flex-wrap">
                            {(['info', 'promotion', 'warning', 'success'] as const).map((v) => {
                              const colors: Record<string, string> = {
                                info: 'bg-sky-500 text-white border-sky-500',
                                promotion: 'bg-indigo-500 text-white border-indigo-500',
                                warning: 'bg-amber-500 text-white border-amber-500',
                                success: 'bg-emerald-500 text-white border-emerald-500',
                              };
                              return (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, variant: v } }))}
                                  className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition-all border ${
                                    liveConfig.announcement.variant === v
                                      ? colors[v]
                                      : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                                  }`}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Badge */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Badge Label</label>
                          <input
                            type="text"
                            value={liveConfig.announcement.badge}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, badge: e.target.value } }))}
                            placeholder="e.g. Public Beta, New Feature, Launch Offer"
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                          />
                        </div>

                        {/* Text */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Announcement Text</label>
                          <input
                            type="text"
                            value={liveConfig.announcement.text}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, text: e.target.value } }))}
                            placeholder="e.g. Analyze up to 5 competitors simultaneously with live SERP data."
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                          />
                        </div>

                        {/* Link */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">CTA Button Text</label>
                            <input
                              type="text"
                              value={liveConfig.announcement.linkText}
                              onChange={(e) => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, linkText: e.target.value } }))}
                              placeholder="Start Free Audit"
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">CTA URL</label>
                            <input
                              type="text"
                              value={liveConfig.announcement.linkUrl}
                              onChange={(e) => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, linkUrl: e.target.value } }))}
                              placeholder="/audit"
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Dismissable */}
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <button
                            type="button"
                            onClick={() => setLiveConfig(prev => ({ ...prev, announcement: { ...prev.announcement, dismissable: !prev.announcement.dismissable } }))}
                          >
                            {liveConfig.announcement.dismissable
                              ? <ToggleRight className="size-6 text-emerald-500" />
                              : <ToggleLeft className="size-6 text-slate-400 dark:text-slate-600" />}
                          </button>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dismissable by user</span>
                        </label>
                      </div>

                      {/* Live Preview */}
                      {liveConfig.announcement.enabled && (
                        <div className={`mx-5 mb-5 p-3 rounded-xl border text-xs font-medium flex items-center gap-3 ${
                          liveConfig.announcement.variant === 'promotion' ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-300' :
                          liveConfig.announcement.variant === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300' :
                          liveConfig.announcement.variant === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' :
                          'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/40 text-sky-800 dark:text-sky-300'
                        }`}>
                          {liveConfig.announcement.badge && (
                            <span className="px-2 py-0.5 rounded-full border border-current text-[10px] font-bold uppercase tracking-wider bg-white/60 dark:bg-black/30 shrink-0">
                              {liveConfig.announcement.badge}
                            </span>
                          )}
                          <span className="truncate text-slate-800 dark:text-slate-200 font-medium flex-1">{liveConfig.announcement.text || '(No text set)'}</span>
                          {liveConfig.announcement.linkText && (
                            <span className="font-semibold underline shrink-0">{liveConfig.announcement.linkText}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* === CARD 3: DEFAULT DAILY CREDITS === */}
                  <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-2.5">
                      <Zap className="size-4 text-emerald-500" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Default Daily AI Credit Limits</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Adjust quota for new sign-ups and optionally apply to all existing free users</p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                            Free User Daily Limit
                            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">{liveConfig.credits.freeUserDailyCredits} credits/day</span>
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={100}
                            step={1}
                            value={liveConfig.credits.freeUserDailyCredits}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, credits: { ...prev.credits, freeUserDailyCredits: Number(e.target.value) } }))}
                            className="w-full accent-emerald-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {[5, 10, 20, 50].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setLiveConfig(prev => ({ ...prev, credits: { ...prev.credits, freeUserDailyCredits: n } }))}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  liveConfig.credits.freeUserDailyCredits === n
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                            Pro User Daily Limit
                            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">{liveConfig.credits.proUserDailyCredits} credits/day</span>
                          </label>
                          <input
                            type="range"
                            min={10}
                            max={500}
                            step={10}
                            value={liveConfig.credits.proUserDailyCredits}
                            onChange={(e) => setLiveConfig(prev => ({ ...prev, credits: { ...prev.credits, proUserDailyCredits: Number(e.target.value) } }))}
                            className="w-full accent-emerald-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            <span>10</span><span>100</span><span>250</span><span>500</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {[50, 100, 200, 500].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setLiveConfig(prev => ({ ...prev, credits: { ...prev.credits, proUserDailyCredits: n } }))}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  liveConfig.credits.proUserDailyCredits === n
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Apply to existing free users toggle */}
                      <div className="mt-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() => setApplyToExistingFreeUsers((prev) => !prev)}
                            >
                              {applyToExistingFreeUsers
                                ? <ToggleRight className="size-6 text-amber-600" />
                                : <ToggleLeft className="size-6 text-slate-400 dark:text-slate-600" />}
                            </button>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Apply to All Existing Free Users</p>
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                              Also update the daily limit for <strong>{adminData.summary.freeUsersCount || 0}</strong> already-registered free accounts. Without this, only new sign-ups get the updated limit.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Changes apply instantly site-wide — no redeployment needed.</p>
                    <button
                      type="button"
                      onClick={handleSaveSiteConfig}
                      disabled={isSavingConfig}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      {isSavingConfig ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      <span>{isSavingConfig ? 'Saving...' : 'Save All Changes'}</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
