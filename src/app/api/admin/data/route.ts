import { NextResponse } from 'next/server';
import { getAllFeedback, getActivityLogs } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authKey = req.headers.get('x-admin-key') || searchParams.get('key');
    const secretKey = process.env.ADMIN_SECRET_KEY || 'analyzeserp-admin-2026';

    if (authKey !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized Admin Access. Invalid Key.' }, { status: 401 });
    }

    const [feedbackList, activityLogs] = await Promise.all([
      getAllFeedback(),
      getActivityLogs(),
    ]);

    // 1. Calculate Summary Metrics
    const totalFeedbackCount = feedbackList.length;
    const totalActivityCount = activityLogs.length;

    const uniqueIps = new Set(activityLogs.map((log) => log.ip_address));
    const uniqueSessions = new Set(activityLogs.map((log) => log.session_id));

    // Calculate Average Rating
    const avgRating =
      totalFeedbackCount > 0
        ? Number(
            (
              feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
              totalFeedbackCount
            ).toFixed(1)
          )
        : 5.0;

    // Tool Usage Counts Breakdown
    const toolUsageCounts: Record<string, number> = {};
    activityLogs.forEach((log) => {
      toolUsageCounts[log.tool_name] = (toolUsageCounts[log.tool_name] || 0) + 1;
    });

    let topTool = 'None';
    let maxUsage = 0;
    Object.entries(toolUsageCounts).forEach(([tool, count]) => {
      if (count > maxUsage) {
        maxUsage = count;
        topTool = tool;
      }
    });

    // 2. Aggregate User Tool Frequency Table (by IP / Session ID)
    const userAggregates: Record<
      string,
      {
        ip: string;
        sessionId: string;
        totalUses: number;
        toolBreakdown: Record<string, number>;
        lastUsedAt: string;
        urls: string[];
      }
    > = {};

    activityLogs.forEach((log) => {
      const key = log.ip_address || log.session_id;
      if (!userAggregates[key]) {
        userAggregates[key] = {
          ip: log.ip_address,
          sessionId: log.session_id,
          totalUses: 0,
          toolBreakdown: {},
          lastUsedAt: log.used_at,
          urls: [],
        };
      }

      const userObj = userAggregates[key];
      userObj.totalUses += 1;
      userObj.toolBreakdown[log.tool_name] = (userObj.toolBreakdown[log.tool_name] || 0) + 1;
      
      if (log.used_at > userObj.lastUsedAt) {
        userObj.lastUsedAt = log.used_at;
      }

      if (log.target_url && !userObj.urls.includes(log.target_url) && userObj.urls.length < 5) {
        userObj.urls.push(log.target_url);
      }
    });

    const userTableData = Object.values(userAggregates).sort(
      (a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalVisitors: uniqueIps.size || uniqueSessions.size,
        totalAuditsRun: totalActivityCount,
        topTool,
        avgRating,
        totalReviews: totalFeedbackCount,
        toolUsageCounts,
      },
      userTable: userTableData,
      feedbackTable: feedbackList,
    });
  } catch (error: any) {
    console.error('[Admin Data API Error]', error);
    return NextResponse.json({ error: 'Failed to generate admin report data' }, { status: 500 });
  }
}
