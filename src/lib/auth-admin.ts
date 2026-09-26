import { auth } from '@/auth';
import { getUserByEmail, adminUpdateUser, logSecurityIncident } from '@/lib/db';
import { getTrustedClientIp } from '@/lib/client-ip';
import crypto from 'crypto';

export interface AdminAuthResult {
  authorized: boolean;
  status: number;
  error?: string;
  adminEmail?: string;
}

/**
 * Dual-Layer Production Admin Verification
 * Requires:
 * 1. An authenticated NextAuth user session (OAuth Google/GitHub)
 * 2. Active account status (not suspended)
 * 3. Valid timing-safe Master Admin Secret Key (Break-glass / 2FA protection)
 */
export async function verifyAdminSession(
  req: Request,
  targetEndpoint: string
): Promise<AdminAuthResult> {
  const clientIp = getTrustedClientIp(req);

  const secretKey = process.env.ADMIN_SECRET_KEY;
  if (!secretKey) {
    return {
      authorized: false,
      status: 503,
      error: 'Admin Console disabled. ADMIN_SECRET_KEY is not configured on this server.',
    };
  }

  const authKey = req.headers.get('x-admin-key');
  if (!authKey) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized Admin Access. Missing administrator passkey header (x-admin-key).',
    };
  }

  // 1. Cryptographic timing-safe comparison of passkey
  const authKeyHash = crypto.createHash('sha256').update(authKey.trim()).digest();
  const secretKeyHash = crypto.createHash('sha256').update(secretKey.trim()).digest();
  const isKeyMatch = crypto.timingSafeEqual(authKeyHash, secretKeyHash);

  // 2. NextAuth Session verification
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!isKeyMatch) {
    logSecurityIncident({
      incident_type: 'UNAUTHORIZED_ADMIN_ATTEMPT',
      severity: 'critical',
      ip_address: clientIp,
      target_endpoint: targetEndpoint,
      details: `Failed admin passkey attempt${userEmail ? ` by authenticated user ${userEmail}` : ''}`,
    }).catch(() => {});

    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized Admin Access. Invalid administrator passkey.',
    };
  }

  if (!userEmail) {
    logSecurityIncident({
      incident_type: 'UNAUTHORIZED_ADMIN_ATTEMPT',
      severity: 'high',
      ip_address: clientIp,
      target_endpoint: targetEndpoint,
      details: 'Valid admin passkey provided, but request lacks an authenticated user session.',
    }).catch(() => {});

    return {
      authorized: false,
      status: 401,
      error: 'Authentication Required: Please sign in with your authorized Google or GitHub account to access the Admin Console.',
    };
  }

  // 3. User status check in database
  const dbUser = await getUserByEmail(userEmail);
  if (dbUser?.status === 'suspended') {
    return {
      authorized: false,
      status: 403,
      error: 'Forbidden: Your administrator account has been suspended.',
    };
  }

  // 4. Ensure user is marked with 'admin' role in database
  if (dbUser && dbUser.role !== 'admin') {
    await adminUpdateUser(userEmail, { role: 'admin' });
  }

  return {
    authorized: true,
    status: 200,
    adminEmail: userEmail,
  };
}
