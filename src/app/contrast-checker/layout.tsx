import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Website Color Contrast & WCAG Compliance Checker',
  description:
    'Extract webpage background, text, and button colors. Audit official W3C WCAG 2.1 AA/AAA contrast ratios with live sandbox preview.',
  alternates: {
    canonical: 'https://analyzeserp.com/contrast-checker',
  },
  openGraph: {
    title: 'Free Website Color Contrast & WCAG Compliance Checker | AnalyzeSERP',
    description:
      'Extract webpage background, text, and button colors. Audit official W3C WCAG 2.1 AA/AAA contrast ratios with live sandbox preview.',
    url: 'https://analyzeserp.com/contrast-checker',
  },
};

export default function ContrastCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
