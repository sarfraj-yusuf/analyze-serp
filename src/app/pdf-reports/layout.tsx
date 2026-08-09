import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free White-Label PDF SEO Report Generator',
  description:
    'Generate white-label PDF competitor audit reports with agency branding and client executive summaries.',
  alternates: {
    canonical: 'https://analyzeserp.com/pdf-reports',
  },
  openGraph: {
    title: 'Free White-Label PDF SEO Report Generator | AnalyzeSERP',
    description:
      'Generate white-label PDF competitor audit reports with agency branding and client executive summaries.',
    url: 'https://analyzeserp.com/pdf-reports',
  },
};

export default function PdfReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
