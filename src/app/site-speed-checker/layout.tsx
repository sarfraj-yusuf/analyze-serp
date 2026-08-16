import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Speed & Core Web Vitals Checker | AnalyzeSERP',
  description:
    'Audit Time to First Byte (TTFB), LCP, INP, CLS, and DOM node latency in real time. Free online Google PageSpeed and Core Web Vitals auditor.',
  alternates: {
    canonical: 'https://analyzeserp.com/site-speed-checker',
  },
  openGraph: {
    title: 'Page Speed & Core Web Vitals Checker | AnalyzeSERP',
    description:
      'Audit Time to First Byte (TTFB), LCP, INP, CLS, and DOM node latency in real time. Free online Google PageSpeed and Core Web Vitals auditor.',
    url: 'https://analyzeserp.com/site-speed-checker',
    type: 'website',
  },
};

export default function SiteSpeedCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
