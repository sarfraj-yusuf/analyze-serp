'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Save,
  Trash2,
  History,
  Sparkles,
  Cloud,
  X,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Filter,
} from 'lucide-react';
import { SinglePageAudit } from '@/types/seo';
import {
  AuditSnapshot,
  getLocalSnapshotsForUrl,
  saveLocalSnapshot,
  deleteLocalSnapshot,
  syncSnapshotToCloud,
  fetchCloudSnapshots,
} from '@/lib/audit-snapshot-manager';
import { compareAudits, AuditDiffReport, calculateAuditScore } from '@/lib/audit-diff-engine';
import { AuthModal } from './AuthModal';

export interface AuditDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAudit: SinglePageAudit;
  targetKeyword?: string;
  initialBaselineSnapshot?: AuditSnapshot;
}

type FilterTab = 'ALL' | 'FIXED' | 'REGRESSED' | 'METRICS';

export const AuditDiffModal: React.FC<AuditDiffModalProps> = ({
  isOpen,
  onClose,
  currentAudit,
  targetKeyword,
  initialBaselineSnapshot,
}) => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Snapshots list & selection
  const [snapshots, setSnapshots] = useState<AuditSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('');

  // Active filter tab & "Hide Unchanged" toggle
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [hideUnchanged, setHideUnchanged] = useState<boolean>(true);

  // New snapshot creation form state
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudSyncedSuccess, setCloudSyncedSuccess] = useState(false);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load available snapshots when modal opens
  useEffect(() => {
    if (!isOpen || !currentAudit?.url) return;

    const localSnaps = getLocalSnapshotsForUrl(currentAudit.url);

    // If initialBaselineSnapshot provided and not in list, add it
    let combined = [...localSnaps];
    if (initialBaselineSnapshot && !combined.some((s) => s.id === initialBaselineSnapshot.id)) {
      combined.unshift(initialBaselineSnapshot);
    }

    setSnapshots(combined);

    if (initialBaselineSnapshot) {
      setSelectedSnapshotId(initialBaselineSnapshot.id);
    } else if (combined.length > 0) {
      setSelectedSnapshotId(combined[0].id);
    }

    // Try fetching cloud snapshots if user is logged in
    if (session?.user?.email) {
      fetchCloudSnapshots(currentAudit.url).then((cloudSnaps) => {
        if (cloudSnaps.length > 0) {
          setSnapshots((prev) => {
            const map = new Map<string, AuditSnapshot>();
            [...prev, ...cloudSnaps].forEach((s) => map.set(s.id, s));
            const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
            if (!selectedSnapshotId && merged.length > 0) {
              setSelectedSnapshotId(merged[0].id);
            }
            return merged;
          });
        }
      });
    }
  }, [isOpen, currentAudit?.url, initialBaselineSnapshot, session?.user?.email]);

  // Selected baseline snapshot
  const baselineSnapshot = useMemo(() => {
    return snapshots.find((s) => s.id === selectedSnapshotId);
  }, [snapshots, selectedSnapshotId]);

  // Diff calculation
  const diffReport: AuditDiffReport | null = useMemo(() => {
    if (!baselineSnapshot || !currentAudit) return null;
    return compareAudits(
      baselineSnapshot.audit,
      currentAudit,
      targetKeyword,
      baselineSnapshot.timestamp
    );
  }, [baselineSnapshot, currentAudit, targetKeyword]);

  if (!isOpen || !mounted) return null;

  // Handle Save Current Audit as a New Snapshot
  const handleSaveCurrentSnapshot = async () => {
    if (!currentAudit) return;

    const now = Date.now();
    const label = newSnapshotLabel.trim() || `Snapshot (${new Date(now).toLocaleDateString()})`;

    const newSnap: AuditSnapshot = {
      id: `snap-${now}-${Math.random().toString(36).slice(2, 7)}`,
      url: currentAudit.url,
      label,
      timestamp: now,
      score: calculateAuditScore(currentAudit),
      targetKeyword,
      audit: currentAudit,
    };

    saveLocalSnapshot(newSnap);
    setSnapshots((prev) => [newSnap, ...prev]);
    setSelectedSnapshotId(newSnap.id);
    setIsCreatingSnapshot(false);
    setNewSnapshotLabel('');

    // If logged in, sync to cloud
    if (session?.user?.email) {
      setCloudSyncing(true);
      const synced = await syncSnapshotToCloud(newSnap);
      setCloudSyncing(false);
      if (synced) {
        setCloudSyncedSuccess(true);
        setTimeout(() => setCloudSyncedSuccess(false), 3000);
      }
    }
  };

  // Handle Delete Snapshot
  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLocalSnapshot(id);
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    if (selectedSnapshotId === id) {
      setSelectedSnapshotId(updated.length > 0 ? updated[0].id : '');
    }
  };

  // Handle Cloud Sync Button
  const handleCloudSync = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!baselineSnapshot) return;

    setCloudSyncing(true);
    const synced = await syncSnapshotToCloud(baselineSnapshot);
    setCloudSyncing(false);
    if (synced) {
      setCloudSyncedSuccess(true);
      setTimeout(() => setCloudSyncedSuccess(false), 3000);
    }
  };

  // Copy Markdown Progress Report
  const handleCopyReport = () => {
    if (!diffReport) return;
    navigator.clipboard.writeText(diffReport.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Audit Progress Tracker &amp; Delta Diff
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  Before vs After
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-md sm:max-w-xl">
                Comparing current crawl against historical baseline for <strong className="font-mono">{currentAudit.url}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Baseline Snapshot Switcher & Capture Form */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Baseline Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-500" />
              <span>Baseline:</span>
            </span>

            {snapshots.length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400 italic">
                No previous snapshots found. Save current crawl below to establish baseline.
              </span>
            ) : (
              <select
                value={selectedSnapshotId}
                onChange={(e) => setSelectedSnapshotId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-sm cursor-pointer"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} — Score: {s.score}/100 ({new Date(s.timestamp).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Tools: Save New Snapshot / Cloud Sync */}
          <div className="flex items-center gap-2">
            {isCreatingSnapshot ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <input
                  type="text"
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  placeholder="e.g. Pre-Redesign Baseline"
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentSnapshot}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs cursor-pointer shadow-xs"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingSnapshot(false)}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingSnapshot(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Save current audit as a new snapshot"
              >
                <Save className="w-3.5 h-3.5 text-indigo-500" />
                <span>Save Snapshot</span>
              </button>
            )}

            {/* Cloud Sync Status */}
            <button
              type="button"
              onClick={handleCloudSync}
              disabled={cloudSyncing}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync snapshots to cloud database across devices"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {cloudSyncedSuccess
                  ? 'Synced!'
                  : cloudSyncing
                  ? 'Syncing...'
                  : session
                  ? 'Cloud Synced'
                  : 'Sync to Account'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-4 sm:p-5 space-y-4">
          
          {!diffReport ? (
            /* Empty State: No baseline to compare against */
            <div className="py-12 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <GitCompare className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No Baseline Snapshot Selected
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click <strong>&quot;Save Snapshot&quot;</strong> above to record your first crawl baseline. After making optimizations on your page, re-audit to view score movements and resolved issues!
              </p>
              <button
                type="button"
                onClick={handleSaveCurrentSnapshot}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Initial Baseline Now</span>
              </button>
            </div>
          ) : (
            <>
              {/* Executive Delta Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Score Trajectory */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg shrink-0 shadow-2xs ${
                        diffReport.scoreDelta > 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : diffReport.scoreDelta < 0
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {diffReport.scoreDelta >= 0 ? `+${diffReport.scoreDelta}` : diffReport.scoreDelta}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {diffReport.status === 'IMPROVED'
                            ? 'Optimization Score Increased'
                            : diffReport.status === 'REGRESSED'
                            ? 'Score Regression Detected'
                            : 'Score Maintained'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            diffReport.scoreDelta > 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : diffReport.scoreDelta < 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {diffReport.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Baseline: <strong className="text-slate-800 dark:text-slate-200 font-mono">{diffReport.baselineScore}/100</strong>{' '}
                        &rarr; Current: <strong className="text-slate-800 dark:text-slate-200 font-mono">{diffReport.currentScore}/100</strong>
                      </div>
                    </div>
                  </div>

                  {/* 4 Summary KPI Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{diffReport.summary.fixedCount} Fixed</span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>{diffReport.summary.regressedCount} Regressed</span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex items-center gap-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {diffReport.summary.wordCountDelta >= 0
                          ? `+${diffReport.summary.wordCountDelta.toLocaleString()} words`
                          : `${diffReport.summary.wordCountDelta.toLocaleString()} words`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Filters & "Hide Unchanged" Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ALL')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      activeTab === 'ALL'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Changes ({diffReport.fixedIssues.length + diffReport.regressedIssues.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('FIXED')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      activeTab === 'FIXED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fixed ({diffReport.fixedIssues.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('REGRESSED')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      activeTab === 'REGRESSED'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-rose-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Regressed ({diffReport.regressedIssues.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('METRICS')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      activeTab === 'METRICS'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Field Breakdown
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideUnchanged}
                    onChange={(e) => setHideUnchanged(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Hide Unchanged Items (Sitebulb Mode)</span>
                </label>
              </div>

              {/* Tab 1, 2, 3: Issues Diff Ledger */}
              {(activeTab === 'ALL' || activeTab === 'FIXED' || activeTab === 'REGRESSED') && (
                <div className="space-y-3">
                  {/* Fixed Issues List */}
                  {(activeTab === 'ALL' || activeTab === 'FIXED') && diffReport.fixedIssues.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved SEO Optimizations ({diffReport.fixedIssues.length})</span>
                      </div>

                      <div className="space-y-2">
                        {diffReport.fixedIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-3.5 rounded-xl border border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                                {issue.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                FIXED
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/5 space-y-0.5">
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                                  Before (Baseline):
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 font-medium">{issue.beforeDetail}</p>
                              </div>

                              <div className="p-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-0.5">
                                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
                                  After (Current):
                                </span>
                                <p className="text-emerald-900 dark:text-emerald-200 font-bold">{issue.afterDetail}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regressed Issues List */}
                  {(activeTab === 'ALL' || activeTab === 'REGRESSED') && diffReport.regressedIssues.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>New Regressions Detected ({diffReport.regressedIssues.length})</span>
                      </div>

                      <div className="space-y-2">
                        {diffReport.regressedIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-3.5 rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                                {issue.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                                REGRESSED
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/5 space-y-0.5">
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                                  Before (Baseline):
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 font-medium">{issue.beforeDetail}</p>
                              </div>

                              <div className="p-2 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-0.5">
                                <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase font-semibold">
                                  After (Current):
                                </span>
                                <p className="text-rose-900 dark:text-rose-200 font-bold">{issue.afterDetail}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pre-existing Unchanged Issues (shown if hideUnchanged is false) */}
                  {!hideUnchanged && diffReport.unchangedIssues.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pre-existing Issues Requiring Action ({diffReport.unchangedIssues.length})</span>
                      </div>

                      <div className="space-y-2">
                        {diffReport.unchangedIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/40 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {issue.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                UNCHANGED
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{issue.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Granular Field Diff Breakdown */}
              {activeTab === 'METRICS' && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-3 shadow-2xs">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-white/5">
                    Metric Comparison Matrix
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {diffReport.fieldDiffs.map((fd) => {
                      return (
                        <div
                          key={fd.field}
                          className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {fd.label}
                          </span>

                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-500 dark:text-slate-400">
                              {fd.beforeValue}
                            </span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {fd.afterValue}
                            </span>

                            {fd.deltaValue && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  fd.isPositiveChange
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : fd.isNegativeChange
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {fd.deltaValue}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {snapshots.length} snapshot{snapshots.length === 1 ? '' : 's'} recorded for this URL
          </div>

          <div className="flex items-center gap-2">
            {diffReport && (
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Progress Report</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          featureTitle="Audit Cloud Sync"
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
