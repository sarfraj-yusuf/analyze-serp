import { SinglePageAudit } from '@/types/seo';
import { calculateAuditScore } from './audit-diff-engine';

export interface AuditSnapshot {
  id: string;
  url: string;
  label: string;
  timestamp: number;
  score: number;
  targetKeyword?: string;
  audit: SinglePageAudit;
  isCloudSynced?: boolean;
}

const STORAGE_KEY = 'analyzeserp_audit_snapshots';
const MAX_SNAPSHOTS_PER_URL = 10;

/**
 * Retrieves all locally saved snapshots
 */
export function getAllLocalSnapshots(): AuditSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditSnapshot[];
  } catch (err) {
    console.warn('[SnapshotManager] Failed to read snapshots from localStorage:', err);
    return [];
  }
}

/**
 * Retrieves snapshots for a specific URL, ordered newest first
 */
export function getLocalSnapshotsForUrl(url: string): AuditSnapshot[] {
  if (!url) return [];
  const cleanUrl = url.trim().toLowerCase();
  const all = getAllLocalSnapshots();
  return all
    .filter((s) => s.url.trim().toLowerCase() === cleanUrl)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Saves a snapshot to localStorage and caps snapshots to avoid storage bloat
 */
export function saveLocalSnapshot(snapshot: AuditSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllLocalSnapshots();
    const cleanUrl = snapshot.url.trim().toLowerCase();

    // Filter out existing snapshot with same id if updating
    const existingFiltered = all.filter((s) => s.id !== snapshot.id);

    // Enforce max count per URL
    const urlSnapshots = existingFiltered.filter(
      (s) => s.url.trim().toLowerCase() === cleanUrl
    );
    if (urlSnapshots.length >= MAX_SNAPSHOTS_PER_URL) {
      // Remove the oldest snapshot for this URL
      urlSnapshots.sort((a, b) => a.timestamp - b.timestamp);
      const oldestId = urlSnapshots[0].id;
      const indexToRemove = existingFiltered.findIndex((s) => s.id === oldestId);
      if (indexToRemove !== -1) {
        existingFiltered.splice(indexToRemove, 1);
      }
    }

    existingFiltered.unshift(snapshot);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingFiltered));
  } catch (err) {
    console.warn('[SnapshotManager] Failed to save snapshot to localStorage:', err);
  }
}

/**
 * Deletes a snapshot by ID from localStorage
 */
export function deleteLocalSnapshot(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllLocalSnapshots();
    const filtered = all.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('[SnapshotManager] Failed to delete snapshot from localStorage:', err);
  }
}

/**
 * Syncs a snapshot to the cloud database if user is logged in
 */
export async function syncSnapshotToCloud(snapshot: AuditSnapshot): Promise<boolean> {
  try {
    const res = await fetch('/api/audit/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: snapshot.url,
        label: snapshot.label,
        score: snapshot.score,
        targetKeyword: snapshot.targetKeyword,
        snapshotJson: JSON.stringify(snapshot),
      }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('[SnapshotManager] Cloud sync failed, snapshot retained locally:', err);
    return false;
  }
}

/**
 * Fetches cloud snapshots for the current authenticated user
 */
export async function fetchCloudSnapshots(url?: string): Promise<AuditSnapshot[]> {
  try {
    const endpoint = url
      ? `/api/audit/snapshots?url=${encodeURIComponent(url)}`
      : '/api/audit/snapshots';
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.success || !Array.isArray(data.snapshots)) return [];

    return data.snapshots
      .map((row: any) => {
        try {
          const parsed = JSON.parse(row.snapshot_json);
          return {
            ...parsed,
            id: `cloud-${row.id}`,
            isCloudSynced: true,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as AuditSnapshot[];
  } catch (err) {
    console.warn('[SnapshotManager] Failed to fetch cloud snapshots:', err);
    return [];
  }
}

/**
 * Automatically captures a snapshot when an audit completes, detecting if a previous baseline exists
 */
export function autoCaptureSnapshot(
  audit: SinglePageAudit,
  targetKeyword?: string
): { captured: boolean; previousSnapshot?: AuditSnapshot } {
  if (!audit || !audit.url || audit.status !== 'success') {
    return { captured: false };
  }

  const existing = getLocalSnapshotsForUrl(audit.url);
  const previousSnapshot = existing.length > 0 ? existing[0] : undefined;

  // Create new snapshot
  const now = Date.now();
  const label = previousSnapshot
    ? `Revision (${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
    : `Baseline Crawl (${new Date(now).toLocaleDateString()})`;

  const newSnapshot: AuditSnapshot = {
    id: `snap-${now}-${Math.random().toString(36).slice(2, 7)}`,
    url: audit.url,
    label,
    timestamp: now,
    score: calculateAuditScore(audit),
    targetKeyword,
    audit,
  };

  saveLocalSnapshot(newSnapshot);

  return {
    captured: true,
    previousSnapshot,
  };
}
