import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { syncUserOnLogin, getUserCredits } from '@/lib/user-credits';
import { getUserByEmail } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user.email && account) {
        try {
          await syncUserOnLogin({
            id: user.id || user.email,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
          });
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
            const [credits, dbUser] = await Promise.all([
              getUserCredits(session.user.email),
              getUserByEmail(session.user.email),
            ]);
            session.user.credits = credits;
            if (dbUser) {
              session.user.role = (dbUser.role as any) || 'user';
              session.user.status = (dbUser.status as any) || 'active';
            }
          } catch {
            session.user.credits = { remainingCredits: 5, limit: 5, usedCredits: 0, resetInHours: 24 };
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
    signIn: '/',
  },
  trustHost: true,
});
