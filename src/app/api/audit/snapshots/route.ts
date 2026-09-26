import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  saveUserAuditSnapshot,
  getUserAuditSnapshots,
  getUserAuditSnapshotById,
  deleteUserAuditSnapshot,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', snapshots: [] },
        { status: 401 }
      );
    }

    if (session.user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended by an administrator.', isSuspended: true, snapshots: [] },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
      const snapshotId = parseInt(idParam, 10);
      if (isNaN(snapshotId)) {
        return NextResponse.json({ success: false, error: 'Invalid snapshot ID' }, { status: 400 });
      }

      const snapshot = await getUserAuditSnapshotById(session.user.email, snapshotId);
      if (!snapshot) {
        return NextResponse.json({ success: false, error: 'Snapshot not found' }, { status: 404 });
      }

      let parsedPayload: any = null;
      try {
        parsedPayload = JSON.parse(snapshot.snapshot_json);
      } catch {
        parsedPayload = null;
      }

      return NextResponse.json({
        success: true,
        snapshot: {
          ...snapshot,
          parsed: parsedPayload,
        },
      });
    }

    const targetUrl = searchParams.get('url') || undefined;
    const snapshots = await getUserAuditSnapshots(session.user.email, targetUrl, 50);

    return NextResponse.json({
      success: true,
      snapshots,
    });
  } catch (error) {
    console.error('[API /api/audit/snapshots GET Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch snapshots', snapshots: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to save snapshots to your cloud account.' },
        { status: 401 }
      );
    }

    if (session.user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended by an administrator. Cannot save snapshots.', isSuspended: true },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { url, label, score, targetKeyword, snapshotJson } = body;

    if (!url || !label || typeof score !== 'number' || !snapshotJson) {
      return NextResponse.json(
        { success: false, error: 'Invalid snapshot payload. URL, label, score, and snapshotJson are required.' },
        { status: 400 }
      );
    }

    const saved = await saveUserAuditSnapshot({
      user_email: session.user.email,
      url: url.trim(),
      label: label.trim(),
      score,
      target_keyword: targetKeyword ? targetKeyword.trim() : null,
      snapshot_json: typeof snapshotJson === 'string' ? snapshotJson : JSON.stringify(snapshotJson),
    });

    return NextResponse.json({
      success: saved,
      message: 'Audit snapshot saved to cloud history successfully',
    });
  } catch (error) {
    console.error('[API /api/audit/snapshots POST Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save snapshot to cloud database' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Account suspended.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const snapshotIdStr = searchParams.get('id');

    if (!snapshotIdStr) {
      return NextResponse.json(
        { success: false, error: 'Missing snapshot id parameter' },
        { status: 400 }
      );
    }

    const snapshotId = parseInt(snapshotIdStr, 10);
    if (isNaN(snapshotId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid snapshot id' },
        { status: 400 }
      );
    }

    const deleted = await deleteUserAuditSnapshot(session.user.email, snapshotId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Snapshot not found or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Snapshot deleted successfully',
    });
  } catch (error) {
    console.error('[API /api/audit/snapshots DELETE Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete snapshot' },
      { status: 500 }
    );
  }
}
