import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Technical SEO & Speed Health Auditor',
  description:
    'Audit page load time, HTML size, robots.txt crawlability, canonical status, and mobile friendliness in 1 click.',
  alternates: {
    canonical: 'https://analyzeserp.com/technical-health',
  },
  openGraph: {
    title: 'Free Technical SEO & Speed Health Auditor | AnalyzeSERP',
    description:
      'Audit page load time, HTML size, robots.txt crawlability, canonical status, and mobile friendliness in 1 click.',
    url: 'https://analyzeserp.com/technical-health',
  },
};

export default function TechnicalHealthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
