import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Contrast Checker & WCAG Accessibility Auditor | AnalyzeSERP',
  description:
    'Test foreground and background text color contrast ratios against WCAG 2.1 AA and AAA standards. Free online color contrast checker for web accessibility.',
  alternates: {
    canonical: 'https://analyzeserp.com/contrast-checker',
  },
  openGraph: {
    title: 'Color Contrast Checker & WCAG Accessibility Auditor | AnalyzeSERP',
    description:
      'Test foreground and background text color contrast ratios against WCAG 2.1 AA and AAA standards. Free online color contrast checker for web accessibility.',
    url: 'https://analyzeserp.com/contrast-checker',
    type: 'website',
  },
};

export default function ContrastCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
