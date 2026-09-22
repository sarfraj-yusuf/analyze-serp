import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserCredits } from '@/lib/user-credits';
import {
  getUserAudits,
  getUserAiActivities,
  getUserDashboardStats,
  getUserAuditSnapshots,
  deleteUserAudit,
} from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Please sign in to view your account history.',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Fetch credits, audits, snapshots, AI activity, and stats in parallel
    const [credits, audits, snapshotsRaw, aiActivities, stats] = await Promise.all([
      getUserCredits(userEmail),
      getUserAudits(userEmail, 50),
      getUserAuditSnapshots(userEmail, undefined, 30),
      getUserAiActivities(userEmail, 50),
      getUserDashboardStats(userEmail),
    ]);

    // Format lightweight snapshot summary for dashboard display
    const snapshots = snapshotsRaw.map((s) => ({
      id: s.id,
      url: s.url,
      label: s.label,
      score: s.score,
      target_keyword: s.target_keyword,
      created_at: s.created_at,
    }));

    return NextResponse.json({
      success: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      credits,
      audits,
      snapshots,
      aiActivities,
      stats,
    });
  } catch (error) {
    console.error('[User History API Error]:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve user history',
        success: false,
      },
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

    const { searchParams } = new URL(req.url);
    const auditIdStr = searchParams.get('id');

    if (!auditIdStr) {
      return NextResponse.json(
        { success: false, error: 'Missing audit id parameter' },
        { status: 400 }
      );
    }

    const auditId = parseInt(auditIdStr, 10);
    if (isNaN(auditId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid audit id' },
        { status: 400 }
      );
    }

    const deleted = await deleteUserAudit(session.user.email, auditId);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Audit history entry deleted' : 'Audit entry not found',
    });
  } catch (error) {
    console.error('[User History API DELETE Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete audit history entry' },
      { status: 500 }
    );
  }
}
