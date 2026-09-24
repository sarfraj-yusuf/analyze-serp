import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Readability Score Checker & Flesch Kincaid Auditor',
  description:
    'Audit content readability scores, analyze Flesch-Kincaid grade levels, detect passive voice ratio, and optimize article complexity for Google Helpful Content.',
  alternates: {
    canonical: 'https://analyzeserp.com/readability',
  },
  openGraph: {
    title: 'Readability Score Checker & Flesch Kincaid Auditor | AnalyzeSERP',
    description:
      'Audit content readability scores, analyze Flesch-Kincaid grade levels, and optimize article complexity for Google Helpful Content.',
    url: 'https://analyzeserp.com/readability',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Readability Score Checker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Readability Score Checker & Flesch Kincaid Auditor | AnalyzeSERP',
    description:
      'Audit content readability scores and analyze Flesch-Kincaid grade levels.',
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
      name: 'Readability Calculator',
      item: 'https://analyzeserp.com/readability',
    },
  ],
};

export default function ReadabilityLayout({ children }: { children: React.ReactNode }) {
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
