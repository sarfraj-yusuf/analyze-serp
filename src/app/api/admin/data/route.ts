import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getAllFeedback,
  getActivityLogs,
  getAllUsers,
  getCompetitorMarketIntelligence,
  getSystemHealthTelemetry,
  getSecurityIncidents,
  getBannedIps,
  logSecurityIncident,
  getSiteConfigurations,
} from '@/lib/db';

export async function GET(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : req.headers.get('x-real-ip') || '127.0.0.1';

    const secretKey = process.env.ADMIN_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Admin API disabled. ADMIN_SECRET_KEY is not configured on this server.' },
        { status: 503 }
      );
    }

    const authKey = req.headers.get('x-admin-key');
    if (!authKey) {
      return NextResponse.json(
        { error: 'Unauthorized Admin Access. Missing x-admin-key header.' },
        { status: 401 }
      );
    }

    const authKeyBuf = Buffer.from(authKey);
    const secretKeyBuf = Buffer.from(secretKey);

    const isMatch =
      authKeyBuf.length === secretKeyBuf.length &&
      crypto.timingSafeEqual(authKeyBuf, secretKeyBuf);

    if (!isMatch) {
      logSecurityIncident({
        incident_type: 'UNAUTHORIZED_ADMIN_ATTEMPT',
        severity: 'high',
        ip_address: clientIp,
        target_endpoint: '/api/admin/data',
        details: 'Unauthorized admin dashboard access attempt with invalid passkey',
      }).catch(() => {});

      return NextResponse.json({ error: 'Unauthorized Admin Access. Invalid Key.' }, { status: 401 });
    }

    const [
      feedbackList,
      activityLogs,
      usersList,
      marketIntelligence,
      systemHealth,
      securityIncidents,
      bannedIps,
      siteConfig,
    ] = await Promise.all([
      getAllFeedback(),
      getActivityLogs(),
      getAllUsers(),
      getCompetitorMarketIntelligence(),
      getSystemHealthTelemetry(),
      getSecurityIncidents(50),
      getBannedIps(),
      getSiteConfigurations(),
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

    // 3. User Metrics Calculation
    const totalRegisteredUsers = usersList.length;
    const proUsersCount = usersList.filter((u) => u.role === 'pro').length;
    const freeUsersCount = usersList.filter((u) => u.role !== 'pro').length;
    const activeUsersCount = usersList.filter((u) => u.status !== 'suspended').length;
    const suspendedUsersCount = usersList.filter((u) => u.status === 'suspended').length;

    // 4. Pre-calculated Visual Charts Data
    const totalExecutions = Math.max(1, totalActivityCount);
    const toolBreakdownChart = Object.entries(toolUsageCounts)
      .map(([tool, count]) => ({
        tool,
        count,
        percentage: Math.round((count / totalExecutions) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const totalUsersCalc = Math.max(1, totalRegisteredUsers);
    const userTierChart = [
      { name: 'Free Users', count: freeUsersCount, percentage: Math.round((freeUsersCount / totalUsersCalc) * 100), color: '#38bdf8' },
      { name: 'Pro Members', count: proUsersCount, percentage: Math.round((proUsersCount / totalUsersCalc) * 100), color: '#10b981' },
    ];

    const userStatusChart = [
      { name: 'Active', count: activeUsersCount, percentage: Math.round((activeUsersCount / totalUsersCalc) * 100), color: '#10b981' },
      { name: 'Suspended', count: suspendedUsersCount, percentage: Math.round((suspendedUsersCount / totalUsersCalc) * 100), color: '#f43f5e' },
    ];

    // 7-Day Velocity Timeline
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      last7Days[dayKey] = 0;
    }
    activityLogs.forEach((log) => {
      try {
        const logDay = new Date(log.used_at).toISOString().split('T')[0];
        if (last7Days[logDay] !== undefined) {
          last7Days[logDay] += 1;
        }
      } catch {}
    });
    const recentActivityTimeline = Object.entries(last7Days).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalVisitors: uniqueIps.size || uniqueSessions.size,
        totalAuditsRun: totalActivityCount,
        topTool,
        avgRating,
        totalReviews: totalFeedbackCount,
        toolUsageCounts,
        totalRegisteredUsers,
        proUsersCount,
        freeUsersCount,
        activeUsersCount,
        suspendedUsersCount,
        uniqueDomainsCount: marketIntelligence.uniqueDomainsCount,
        uniqueKeywordsCount: marketIntelligence.uniqueKeywordsCount,
        platformAvgScore: marketIntelligence.platformAvgScore,
      },
      charts: {
        toolBreakdownChart,
        userTierChart,
        userStatusChart,
        recentActivityTimeline,
      },
      marketIntelligence,
      systemHealth,
      securityIncidents,
      bannedIps,
      usersList,
      userTable: userTableData,
      feedbackTable: feedbackList,
      siteConfig,
    });
  } catch (error: any) {
    console.error('[Admin Data API Error]', error);
    return NextResponse.json({ error: 'Failed to generate admin report data' }, { status: 500 });
  }
}
