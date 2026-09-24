import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Speed & Core Web Vitals Checker',
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
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Page Speed & Core Web Vitals Checker | AnalyzeSERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Speed & Core Web Vitals Checker | AnalyzeSERP',
    description:
      'Audit Time to First Byte (TTFB), LCP, INP, CLS, and DOM node latency in real time. Free online Google PageSpeed and Core Web Vitals auditor.',
    images: ['/og-image.jpg'],
  },
};

export default function SiteSpeedCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
