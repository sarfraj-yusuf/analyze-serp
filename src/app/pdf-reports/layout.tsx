import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'White-Label PDF SEO Audit Report Generator | AnalyzeSERP',
  description:
    'Generate branded white-label PDF SEO audit reports with agency logos, executive summaries, and action roadmaps. Free online client report builder.',
  alternates: {
    canonical: 'https://analyzeserp.com/pdf-reports',
  },
  openGraph: {
    title: 'White-Label PDF SEO Audit Report Generator | AnalyzeSERP',
    description:
      'Generate branded white-label PDF SEO audit reports with agency logos, executive summaries, and action roadmaps. Free online client report builder.',
    url: 'https://analyzeserp.com/pdf-reports',
    type: 'website',
  },
};

export default function PdfReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
