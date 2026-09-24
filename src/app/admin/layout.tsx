import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  description: 'Internal administration and analytics dashboard.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
