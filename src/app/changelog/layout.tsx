import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog & Product Release Notes',
  description:
    'Stay updated with the latest releases, performance improvements, advanced SEO tools, and architecture updates shipped to AnalyzeSERP.',
  alternates: {
    canonical: 'https://analyzeserp.com/changelog',
  },
  openGraph: {
    title: 'Changelog & Product Release Notes | AnalyzeSERP',
    description:
      'Stay updated with the latest releases, performance improvements, advanced SEO tools, and architecture updates shipped to AnalyzeSERP.',
    url: 'https://analyzeserp.com/changelog',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Changelog & Release Notes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Changelog & Product Release Notes | AnalyzeSERP',
    description:
      'Stay updated with the latest releases, performance improvements, and advanced SEO tools shipped to AnalyzeSERP.',
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
      name: 'Changelog',
      item: 'https://analyzeserp.com/changelog',
    },
  ],
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
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
