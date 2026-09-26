import {
  upsertUser,
  getUserByEmail,
  atomicReserveUserAiCredit,
  atomicRefundUserAiCredit,
  atomicReserveUserAuditCredits,
  atomicRefundUserAuditCredits,
  DbUser,
} from './db';

export interface UserCreditsInfo {
  remainingCredits: number;
  limit: number;
  usedCredits: number;
  resetInHours: number;
}

export interface UserAuditQuotaInfo {
  allowed: boolean;
  remainingCredits: number;
  limit: number;
  usedCredits: number;
  resetInHours: number;
  role: 'user' | 'pro' | 'admin';
  isUnlimited: boolean;
}

/**
 * Syncs user upon login (inserts new or updates existing)
 */
export async function syncUserOnLogin(data: {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  provider: string;
  providerId: string;
}): Promise<DbUser> {
  return await upsertUser({
    id: data.id,
    name: data.name,
    email: data.email,
    image: data.image,
    provider: data.provider,
    provider_id: data.providerId,
  });
}

/**
 * Retrieves remaining daily AI credits for a user, automatically resetting if 24 hours have passed.
 */
export async function getUserCredits(email: string): Promise<UserCreditsInfo> {
  const user = await getUserByEmail(email);

  // Security guard: Only registered users present in DB receive AI credits
  if (!user) {
    return {
      remainingCredits: 0,
      limit: 0,
      usedCredits: 0,
      resetInHours: 0,
    };
  }

  const now = Date.now();
  const lastResetTime = user.last_credit_reset ? new Date(user.last_credit_reset).getTime() : 0;
  const diffMs = now - lastResetTime;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  // Read-only virtual reset calculation if 24 hours have elapsed
  // (Actual atomic DB state update is handled atomically on consumption via atomicReserveUserAiCredit)
  if (diffMs >= twentyFourHoursMs || !lastResetTime) {
    return {
      remainingCredits: user.daily_ai_credits_limit,
      limit: user.daily_ai_credits_limit,
      usedCredits: 0,
      resetInHours: 24,
    };
  }

  const remainingHours = Math.max(1, Math.ceil((twentyFourHoursMs - diffMs) / (60 * 60 * 1000)));
  const remainingCredits = Math.max(0, user.daily_ai_credits_limit - user.daily_ai_credits_used);

  return {
    remainingCredits,
    limit: user.daily_ai_credits_limit,
    usedCredits: user.daily_ai_credits_used,
    resetInHours: remainingHours,
  };
}

/**
 * Atomically reserves 1 AI credit before calling Gemini to eliminate race conditions.
 */
export async function reserveUserCredit(
  email: string
): Promise<{ success: boolean; remainingCredits: number; limit: number; error?: string }> {
  return await atomicReserveUserAiCredit(email);
}

/**
 * Atomically refunds 1 AI credit if Gemini generation fails.
 */
export async function refundUserCredit(email: string): Promise<boolean> {
  return await atomicRefundUserAiCredit(email);
}

/**
 * Atomically reserves audit quota before execution to eliminate batch flood race conditions.
 */
export async function reserveUserAuditQuota(
  email: string,
  count: number
): Promise<{ success: boolean; remainingCredits: number; limit: number; error?: string }> {
  return await atomicReserveUserAuditCredits(email, count);
}

/**
 * Atomically refunds audit credits if scraping fails.
 */
export async function refundUserAuditQuota(email: string, count: number): Promise<boolean> {
  return await atomicRefundUserAuditCredits(email, count);
}

/**
 * Consumes 1 AI credit for a user if available (atomic database-level increment).
 */
export async function consumeUserCredit(
  email: string
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  return await atomicReserveUserAiCredit(email);
}

/**
 * Retrieves remaining daily audit quota for an authenticated user, resetting every 24 hours.
 */
export async function getUserAuditQuota(
  email: string,
  requestedCount: number = 1
): Promise<UserAuditQuotaInfo> {
  const user = await getUserByEmail(email);

  // Security guard: Only registered users present in DB receive an authenticated audit quota
  // (Unregistered / guest users are handled by the IP-based freemium limiter in /api/audit)
  if (!user) {
    return {
      allowed: false,
      remainingCredits: 0,
      limit: 0,
      usedCredits: 0,
      resetInHours: 0,
      role: 'user',
      isUnlimited: false,
    };
  }

  const role: 'user' | 'pro' | 'admin' = (user.role as any) || 'user';

  // Suspended users have zero quota
  if (user.status === 'suspended') {
    return {
      allowed: false,
      remainingCredits: 0,
      limit: user.daily_audit_credits_limit || 20,
      usedCredits: user.daily_audit_credits_used || 0,
      resetInHours: 0,
      role,
      isUnlimited: false,
    };
  }

  // Admins have virtually unlimited audits
  if (role === 'admin') {
    return {
      allowed: true,
      remainingCredits: 9999,
      limit: 9999,
      usedCredits: user.daily_audit_credits_used || 0,
      resetInHours: 24,
      role: 'admin',
      isUnlimited: true,
    };
  }

  // Pro users have high volume / unlimited batch capability
  if (role === 'pro') {
    const proLimit = Math.max(200, user.daily_audit_credits_limit || 200);
    const used = user.daily_audit_credits_used || 0;
    return {
      allowed: true,
      remainingCredits: Math.max(0, proLimit - used),
      limit: proLimit,
      usedCredits: used,
      resetInHours: 24,
      role: 'pro',
      isUnlimited: true,
    };
  }

  // Standard registered free user
  const effectiveLimit = user.daily_audit_credits_limit || 20;
  const now = Date.now();
  const lastResetTime = user.last_audit_reset ? new Date(user.last_audit_reset).getTime() : 0;
  const diffMs = now - lastResetTime;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  // Read-only virtual reset calculation if 24 hours have passed or first audit
  // (Actual atomic DB state update is handled atomically on consumption via atomicReserveUserAuditCredits)
  if (diffMs >= twentyFourHoursMs || !lastResetTime) {
    return {
      allowed: requestedCount <= effectiveLimit,
      remainingCredits: effectiveLimit,
      limit: effectiveLimit,
      usedCredits: 0,
      resetInHours: 24,
      role: 'user',
      isUnlimited: false,
    };
  }

  const used = user.daily_audit_credits_used || 0;
  const remainingCredits = Math.max(0, effectiveLimit - used);
  const remainingHours = Math.max(1, Math.ceil((twentyFourHoursMs - diffMs) / (60 * 60 * 1000)));

  return {
    allowed: used + requestedCount <= effectiveLimit,
    remainingCredits,
    limit: effectiveLimit,
    usedCredits: used,
    resetInHours: remainingHours,
    role,
    isUnlimited: false,
  };
}

/**
 * Consumes audit credits for an authenticated user (atomic database-level increment).
 */
export async function consumeUserAuditQuota(
  email: string,
  count: number
): Promise<{ success: boolean; remainingCredits: number; limit: number }> {
  return await atomicReserveUserAuditCredits(email, count);
}
