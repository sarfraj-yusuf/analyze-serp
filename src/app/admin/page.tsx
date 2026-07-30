'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowUpDown,
} from 'lucide-react';

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

interface AdminData {
  summary: {
    totalVisitors: number;
    totalAuditsRun: number;
    topTool: string;
    avgRating: number;
    totalReviews: number;
    toolUsageCounts: Record<string, number>;
  };
  userTable: UserUsageRow[];
  feedbackTable: FeedbackRow[];
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<'usage' | 'feedback'>('usage');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState('All');

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

  const filteredUserTable = adminData?.userTable.filter((user) => {
    const matchesSearch =
      user.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.urls.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTool =
      selectedToolFilter === 'All' ||
      Boolean(user.toolBreakdown[selectedToolFilter]);

    return matchesSearch && matchesTool;
  });

  const filteredFeedbackTable = adminData?.feedbackTable.filter((fb) => {
    return (
      fb.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.user_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.email && fb.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-slate-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Internal Admin & User Analytics Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              AnalyzeSERP <span className="gradient-text">Admin Control Center</span>
            </h1>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => fetchAdminData(adminKey)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl glass-panel border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Analytics Data</span>
            </button>
          )}
        </div>

        {/* Authentication Login Screen */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto py-12">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Key className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Admin Authentication</h3>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Enter your Secret Admin Passkey to access real-time user activity logs and stored feedback database.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  required
                  placeholder="Enter Secret Admin Key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-xs text-center font-mono focus:outline-none"
                />

                {errorMsg && (
                  <div className="text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying Admin Key...' : 'Unlock Admin Panel'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          adminData && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                      Total Active Sessions
                    </span>
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {adminData.summary.totalVisitors}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">Unique IPs / Users</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                      Total Tool Executions
                    </span>
                    <Activity className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {adminData.summary.totalAuditsRun}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">Tool Audits Completed</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                      Most Used Tool
                    </span>
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white truncate">
                    {adminData.summary.topTool}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">Highest Engagement</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                      User Rating Average
                    </span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{adminData.summary.avgRating}</span>
                    <span className="text-xs font-normal text-slate-400">/ 5.0 ⭐</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">
                    {adminData.summary.totalReviews} Reviews Saved
                  </div>
                </div>
              </div>

              {/* Control Toolbar: Navigation Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                {/* Tabs */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'usage'
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>User Tool Usage & Frequency Table ({filteredUserTable?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'feedback'
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>User Reviews & Suggestions ({filteredFeedbackTable?.length || 0})</span>
                  </button>
                </div>

                {/* Search & Tool Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search IP, Session, or URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tab 1: User Tool Usage Frequency Table */}
              {activeTab === 'usage' && (
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>User Session Activity & Tool Execution Table</span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-bold text-slate-500 dark:text-gray-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-3">User IP Address</th>
                          <th className="px-6 py-3">Total Tool Uses</th>
                          <th className="px-6 py-3">Tools Used Breakdown</th>
                          <th className="px-6 py-3">Last Target URL Audited</th>
                          <th className="px-6 py-3">Last Active Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-mono">
                        {filteredUserTable && filteredUserTable.length > 0 ? (
                          filteredUserTable.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                {row.ip}
                              </td>
                              <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                                  {row.totalUses} executions
                                </span>
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                {Object.entries(row.toolBreakdown).map(([tool, count]) => (
                                  <span
                                    key={tool}
                                    className="inline-block mr-2 mb-1 px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 font-sans"
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
                                    className="hover:underline text-cyan-600 dark:text-cyan-400"
                                  >
                                    {row.urls[0]}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-gray-400 text-[11px] font-sans">
                                {new Date(row.lastUsedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400 font-sans">
                              No user tool activity logged yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: User Reviews & Suggestions Table */}
              {activeTab === 'feedback' && (
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>User Reviews & Feature Suggestions Database</span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-bold text-slate-500 dark:text-gray-400 tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Rating</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">User Role</th>
                          <th className="px-6 py-3">Message / Suggestion</th>
                          <th className="px-6 py-3">Email Contact</th>
                          <th className="px-6 py-3">Submitted Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {filteredFeedbackTable && filteredFeedbackTable.length > 0 ? (
                          filteredFeedbackTable.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-amber-400 font-bold">
                                  <span>{row.rating}</span>
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
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
                                {row.email || <span className="text-slate-400 italic">None</span>}
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-gray-400 text-[11px]">
                                {new Date(row.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">
                              No feedback or suggestions submitted yet.
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
