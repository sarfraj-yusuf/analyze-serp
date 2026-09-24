import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, adminUpdateUser, banIp, unbanIp, getBannedIps, updateSiteConfigurations, logSecurityIncident } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

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

    const authKeyHash = crypto.createHash('sha256').update(authKey).digest();
    const secretKeyHash = crypto.createHash('sha256').update(secretKey).digest();
    const isMatch = crypto.timingSafeEqual(authKeyHash, secretKeyHash);

    if (!isMatch) {
      logSecurityIncident({
        incident_type: 'UNAUTHORIZED_ADMIN_ATTEMPT',
        severity: 'critical',
        ip_address: clientIp,
        target_endpoint: '/api/admin/users/action',
        details: 'Unauthorized admin mutation action attempt with invalid passkey',
      }).catch(() => {});

      return NextResponse.json(
        { error: 'Unauthorized Admin Access. Invalid Key.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, email, ip, reason, value, siteConfig, applyToExistingFreeUsers } = body;

    // 1. IP Blacklist Security Actions
    if (action === 'BAN_IP') {
      if (!ip || typeof ip !== 'string') {
        return NextResponse.json({ error: 'Target IP address is required.' }, { status: 400 });
      }
      const ok = await banIp(ip, reason || 'Manual Admin Block', 'admin');
      const updatedBannedIps = await getBannedIps();
      return NextResponse.json({
        success: ok,
        message: `IP ${ip} has been added to blacklist.`,
        bannedIps: updatedBannedIps,
      });
    }

    if (action === 'UNBAN_IP') {
      if (!ip || typeof ip !== 'string') {
        return NextResponse.json({ error: 'Target IP address is required.' }, { status: 400 });
      }
      const ok = await unbanIp(ip);
      const updatedBannedIps = await getBannedIps();
      return NextResponse.json({
        success: ok,
        message: `IP ${ip} has been removed from blacklist.`,
        bannedIps: updatedBannedIps,
      });
    }

    // 2. Live Site Controls & Announcements
    if (action === 'UPDATE_SITE_CONFIG') {
      if (!siteConfig || typeof siteConfig !== 'object') {
        return NextResponse.json({ error: 'Valid siteConfig object is required.' }, { status: 400 });
      }

      const updated = await updateSiteConfigurations(siteConfig, Boolean(applyToExistingFreeUsers));
      return NextResponse.json({
        success: true,
        message: 'Live site configuration updated successfully.',
        siteConfig: updated,
      });
    }

    // 3. User Accounts Management Actions
    if (!email) {
      return NextResponse.json(
        { error: 'Target user email is required.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found in database.` },
        { status: 404 }
      );
    }

    let success = false;
    let message = '';

    switch (action) {
      case 'ADJUST_CREDITS': {
        const newLimit = Number(value);
        if (isNaN(newLimit) || newLimit < 0) {
          return NextResponse.json({ error: 'Valid positive credit limit required.' }, { status: 400 });
        }
        success = await adminUpdateUser(email, { daily_ai_credits_limit: newLimit });
        message = `Daily AI credit limit for ${email} adjusted to ${newLimit}.`;
        break;
      }

      case 'ADD_BONUS_CREDITS': {
        const bonus = Number(value) || 10;
        const newLimit = (user.daily_ai_credits_limit || 5) + bonus;
        success = await adminUpdateUser(email, { daily_ai_credits_limit: newLimit });
        message = `Added +${bonus} credits to ${email}. New daily limit: ${newLimit}.`;
        break;
      }

      case 'RESET_USAGE': {
        success = await adminUpdateUser(email, { daily_ai_credits_used: 0 });
        message = `Reset today's credit consumption for ${email} to 0.`;
        break;
      }

      case 'UPDATE_ROLE':
      case 'TOGGLE_ROLE': {
        const allowedRoles: ('user' | 'pro' | 'admin')[] = ['user', 'pro', 'admin'];
        const newRole: 'user' | 'pro' | 'admin' = allowedRoles.includes(value) ? value : (value === 'pro' ? 'pro' : 'user');
        const newLimit = newRole === 'admin'
          ? Math.max(100, user.daily_ai_credits_limit || 100)
          : newRole === 'pro'
          ? Math.max(50, user.daily_ai_credits_limit || 50)
          : 5;
        success = await adminUpdateUser(email, {
          role: newRole,
          daily_ai_credits_limit: newLimit,
        });
        message = `User ${email} role updated to ${newRole.toUpperCase()} (Quota: ${newLimit}/day).`;
        break;
      }

      case 'TOGGLE_STATUS': {
        const newStatus = value === 'suspended' ? 'suspended' : 'active';
        success = await adminUpdateUser(email, { status: newStatus });
        message = `Account status for ${email} updated to ${newStatus.toUpperCase()}.`;
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown admin action: ${action}` }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
    }

    // Fetch freshly updated user record
    const updatedUser = await getUserByEmail(email);

    return NextResponse.json({
      success: true,
      message,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('[Admin User Action Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error executing admin action.' },
      { status: 500 }
    );
  }
}
