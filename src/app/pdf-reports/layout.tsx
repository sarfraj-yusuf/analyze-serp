import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'White-Label PDF SEO Audit Report Generator',
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
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'White-Label PDF SEO Audit Report Generator | AnalyzeSERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'White-Label PDF SEO Audit Report Generator | AnalyzeSERP',
    description:
      'Generate branded white-label PDF SEO audit reports with agency logos, executive summaries, and action roadmaps. Free online client report builder.',
    images: ['/og-image.jpg'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://analyzeserp.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'PDF Reports',
      item: 'https://analyzeserp.com/pdf-reports',
    },
  ],
};

export default function PdfReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
