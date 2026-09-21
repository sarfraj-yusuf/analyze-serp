import { upsertUser, getUserByEmail, updateUserCredits, DbUser } from './db';

export interface UserCreditsInfo {
  remainingCredits: number;
  limit: number;
  usedCredits: number;
  resetInHours: number;
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

  // Default fallback if user not found
  if (!user) {
    return {
      remainingCredits: 5,
      limit: 5,
      usedCredits: 0,
      resetInHours: 24,
    };
  }

  const now = Date.now();
  const lastResetTime = new Date(user.last_credit_reset).getTime();
  const diffMs = now - lastResetTime;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  // If more than 24 hours have passed, reset used credits
  if (diffMs >= twentyFourHoursMs) {
    const resetDate = new Date();
    await updateUserCredits(email, 0, resetDate);
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
 * Consumes 1 AI credit for a user if available.
 */
export async function consumeUserCredit(
  email: string
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  const creditsInfo = await getUserCredits(email);

  if (creditsInfo.remainingCredits <= 0) {
    return {
      success: false,
      remainingCredits: 0,
      error: `Daily free AI limit reached (${creditsInfo.limit} credits). Resets in ${creditsInfo.resetInHours}h.`,
    };
  }

  const newUsed = creditsInfo.usedCredits + 1;
  await updateUserCredits(email, newUsed);

  return {
    success: true,
    remainingCredits: creditsInfo.remainingCredits - 1,
  };
}
