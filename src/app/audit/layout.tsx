import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor SEO Audit Report',
  description:
    'Live side-by-side competitor SEO analysis report. Compare on-page signals, keyword gaps, and technical parity in real time.',
  alternates: {
    canonical: 'https://analyzeserp.com/audit',
  },
  openGraph: {
    title: 'Competitor SEO Audit Report | AnalyzeSERP',
    description:
      'Live side-by-side competitor SEO analysis report. Compare on-page signals, keyword gaps, and technical parity in real time.',
    url: 'https://analyzeserp.com/audit',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Competitor SEO Audit Report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Competitor SEO Audit Report | AnalyzeSERP',
    description:
      'Live side-by-side competitor SEO analysis report. Compare on-page signals, keyword gaps, and technical parity in real time.',
    images: ['/og-image.jpg'],
  },
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
