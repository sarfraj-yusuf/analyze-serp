import { DefaultSession } from 'next-auth';
import { UserCreditsInfo } from '@/lib/user-credits';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      credits?: UserCreditsInfo;
    } & DefaultSession['user'];
  }
}
