import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free PageSpeed Insights & Core Web Vitals Checker',
  description:
    'Test real-user Google Core Web Vitals (LCP, INP, CLS, FCP) and Lighthouse performance scores with 1-click speed audit.',
  alternates: {
    canonical: 'https://analyzeserp.com/site-speed-checker',
  },
  openGraph: {
    title: 'Free PageSpeed Insights & Core Web Vitals Checker | AnalyzeSERP',
    description:
      'Test real-user Google Core Web Vitals (LCP, INP, CLS, FCP) and Lighthouse performance scores with 1-click speed audit.',
    url: 'https://analyzeserp.com/site-speed-checker',
  },
};

export default function SiteSpeedCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
