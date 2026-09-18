import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical SEO Audit Tool & Speed Health Inspector | AnalyzeSERP',
  description:
    'Audit server response time (TTFB), HTML payload size, DOM node depth, and SSL security. Free technical SEO health checker for developers & agencies.',
  alternates: {
    canonical: 'https://analyzeserp.com/technical-health',
  },
  openGraph: {
    title: 'Technical SEO Audit Tool & Speed Health Inspector | AnalyzeSERP',
    description:
      'Audit server response time (TTFB), HTML payload size, DOM node depth, and SSL security. Free technical SEO health checker for developers & agencies.',
    url: 'https://analyzeserp.com/technical-health',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Technical Health Inspector',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Technical SEO Audit Tool & Speed Health Inspector | AnalyzeSERP',
    description:
      'Audit server response time (TTFB), HTML payload size, DOM node depth, and SSL security.',
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
      name: 'Technical Health Inspector',
      item: 'https://analyzeserp.com/technical-health',
    },
  ],
};

export default function TechnicalHealthLayout({ children }: { children: React.ReactNode }) {
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
