import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  saveUserAuditSnapshot,
  getUserAuditSnapshots,
  getUserAuditSnapshotById,
  deleteUserAuditSnapshot,
} from '@/lib/db';
import { verifySameOrigin } from '@/lib/csrf';

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
      if (isNaN(snapshotId) || snapshotId <= 0) {
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
    // 1. CSRF / ORIGIN PROTECTION
    const originCheck = verifySameOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json(
        { success: false, error: originCheck.reason || 'Forbidden: Cross-site request rejected.' },
        { status: 403 }
      );
    }

    // 2. AUTHENTICATION & ACCESS CONTROL
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

    // 3. REQUEST PAYLOAD SIZE LIMIT (Max 1 MB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && Number(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Snapshot payload too large. Maximum size is 1 MB.' },
        { status: 413 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { url, label, score, targetKeyword, snapshotJson } = body;

    // 4. STRICT SCHEMA & FIELD BOUNDS VALIDATION
    if (!url || typeof url !== 'string' || url.trim().length === 0 || url.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'Valid URL is required (maximum 500 characters).' },
        { status: 400 }
      );
    }

    try {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json(
          { success: false, error: 'URL must use http or https protocol.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format.' },
        { status: 400 }
      );
    }

    if (!label || typeof label !== 'string' || label.trim().length === 0 || label.trim().length > 255) {
      return NextResponse.json(
        { success: false, error: 'Label is required (maximum 255 characters).' },
        { status: 400 }
      );
    }

    const numScore = Number(score);
    if (!Number.isFinite(numScore) || numScore < 0 || numScore > 100) {
      return NextResponse.json(
        { success: false, error: 'Score must be a valid number between 0 and 100.' },
        { status: 400 }
      );
    }

    let cleanTargetKeyword: string | null = null;
    if (targetKeyword && typeof targetKeyword === 'string' && targetKeyword.trim().length > 0) {
      if (targetKeyword.trim().length > 255) {
        return NextResponse.json(
          { success: false, error: 'Target keyword cannot exceed 255 characters.' },
          { status: 400 }
        );
      }
      cleanTargetKeyword = targetKeyword.trim();
    }

    let serializedJson: string;
    if (typeof snapshotJson === 'string') {
      if (snapshotJson.length > 500000) {
        return NextResponse.json(
          { success: false, error: 'Snapshot data exceeds maximum size limit (500 KB).' },
          { status: 400 }
        );
      }
      try {
        JSON.parse(snapshotJson);
        serializedJson = snapshotJson;
      } catch {
        return NextResponse.json(
          { success: false, error: 'Snapshot data is not valid JSON.' },
          { status: 400 }
        );
      }
    } else if (typeof snapshotJson === 'object' && snapshotJson !== null) {
      try {
        serializedJson = JSON.stringify(snapshotJson);
        if (serializedJson.length > 500000) {
          return NextResponse.json(
            { success: false, error: 'Snapshot data exceeds maximum size limit (500 KB).' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Failed to serialize snapshot data.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'snapshotJson must be a valid JSON string or object.' },
        { status: 400 }
      );
    }

    const saved = await saveUserAuditSnapshot({
      user_email: session.user.email,
      url: url.trim(),
      label: label.trim(),
      score: Math.round(numScore),
      target_keyword: cleanTargetKeyword,
      snapshot_json: serializedJson,
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
    // 1. CSRF / ORIGIN PROTECTION
    const originCheck = verifySameOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json(
        { success: false, error: originCheck.reason || 'Forbidden: Cross-site request rejected.' },
        { status: 403 }
      );
    }

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
    if (isNaN(snapshotId) || snapshotId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid snapshot id parameter' },
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
