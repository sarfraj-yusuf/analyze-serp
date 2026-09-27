import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { syncUserOnLogin, getUserCredits, getUserAuditQuota } from '@/lib/user-credits';
import { getUserByEmail } from '@/lib/db';

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  process.env.ADMIN_SECRET_KEY ||
  (process.env.NODE_ENV !== 'production' ? 'analyzeserp-dev-fallback-secret-at-least-32-chars-long' : undefined);

if (!authSecret && process.env.NODE_ENV === 'production') {
  console.error(
    '[AnalyzeSERP Auth] CRITICAL: Neither AUTH_SECRET nor NEXTAUTH_SECRET is configured in environment variables. OAuth session encryption requires a secret.'
  );
}

const googleClientId =
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_ID;

const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.GOOGLE_SECRET;

const githubClientId =
  process.env.AUTH_GITHUB_ID ||
  process.env.GITHUB_CLIENT_ID ||
  process.env.GITHUB_ID;

const githubClientSecret =
  process.env.AUTH_GITHUB_SECRET ||
  process.env.GITHUB_CLIENT_SECRET ||
  process.env.GITHUB_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user.email) {
        try {
          // Immediately reject login for suspended users
          const existingUser = await getUserByEmail(user.email);
          if (existingUser?.status === 'suspended') {
            console.warn(`[Auth SignIn Denied] Suspended user attempted sign in: ${user.email}`);
            return false;
          }
          if (account) {
            await syncUserOnLogin({
              id: user.id || user.email,
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          }
        } catch (error) {
          console.error('[Auth SignIn Error] Failed to sync user to database:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token?.sub) {
          session.user.id = token.sub;
        }
        if (session.user.email) {
          try {
            const dbUser = await getUserByEmail(session.user.email);

            // Immediate session invalidation for suspended accounts
            if (dbUser?.status === 'suspended') {
              session.user.role = (dbUser.role as any) || 'user';
              session.user.status = 'suspended';
              session.user.credits = { remainingCredits: 0, limit: 0, usedCredits: 0, resetInHours: 0 };
              session.user.auditQuota = {
                allowed: false,
                remainingCredits: 0,
                limit: 0,
                usedCredits: 0,
                resetInHours: 0,
                role: 'user',
                isUnlimited: false,
              };
              return session;
            }

            // Security guard: Only users present in DB receive credits
            if (!dbUser) {
              session.user.role = 'user';
              session.user.status = 'active';
              session.user.credits = { remainingCredits: 0, limit: 0, usedCredits: 0, resetInHours: 0 };
              session.user.auditQuota = {
                allowed: false,
                remainingCredits: 0,
                limit: 0,
                usedCredits: 0,
                resetInHours: 0,
                role: 'user',
                isUnlimited: false,
              };
              return session;
            }

            const [credits, auditQuota] = await Promise.all([
              getUserCredits(session.user.email),
              getUserAuditQuota(session.user.email, 0),
            ]);
            session.user.credits = credits;
            session.user.auditQuota = auditQuota;
            session.user.role = (dbUser.role as any) || 'user';
            session.user.status = (dbUser.status as any) || 'active';
          } catch {
            session.user.credits = { remainingCredits: 0, limit: 0, usedCredits: 0, resetInHours: 0 };
            session.user.auditQuota = {
              allowed: false,
              remainingCredits: 0,
              limit: 0,
              usedCredits: 0,
              resetInHours: 0,
              role: 'user',
              isUnlimited: false,
            };
            session.user.role = 'user';
            session.user.status = 'active';
          }
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id || token.sub;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
});
