import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My SEO Workspace & Audit History | AnalyzeSERP',
  description: 'Manage your saved SEO audits, cloud snapshots, AI credits, and account history.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
