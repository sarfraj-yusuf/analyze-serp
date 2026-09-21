import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserCredits } from '@/lib/user-credits';
import {
  getUserAudits,
  getUserAiActivities,
  getUserDashboardStats,
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

    // Fetch credits, audits, AI activity, and stats in parallel
    const [credits, audits, aiActivities, stats] = await Promise.all([
      getUserCredits(userEmail),
      getUserAudits(userEmail, 50),
      getUserAiActivities(userEmail, 50),
      getUserDashboardStats(userEmail),
    ]);

    return NextResponse.json({
      success: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      credits,
      audits,
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
