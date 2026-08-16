import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical SEO Audit Tool & Speed Health Inspector | AnalyzeSERP',
  description:
    'Audit server response time (TTFB), HTML payload size, DOM node depth, and SSL security. Free technical SEO health checker for developers & agencies.',
  alternates: {
    canonical: 'https://analyzeserp.com/technical-health',
  },
  openGraph: {
    title: 'Technical SEO Audit Tool & Speed Health Inspector | AnalyzeSERP',
    description:
      'Audit server response time (TTFB), HTML payload size, DOM node depth, and SSL security. Free technical SEO health checker for developers & agencies.',
    url: 'https://analyzeserp.com/technical-health',
    type: 'website',
  },
};

export default function TechnicalHealthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
