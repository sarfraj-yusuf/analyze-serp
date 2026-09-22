import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor SEO Audit Report | AnalyzeSERP',
  description:
    'Live side-by-side competitor SEO analysis report. Compare on-page signals, keyword gaps, and technical parity in real time.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
