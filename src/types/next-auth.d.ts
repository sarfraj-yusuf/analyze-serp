import { DefaultSession } from 'next-auth';
import { UserCreditsInfo } from '@/lib/user-credits';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: 'user' | 'pro' | 'admin';
      status?: 'active' | 'suspended';
      credits?: UserCreditsInfo;
    } & DefaultSession['user'];
  }
}
