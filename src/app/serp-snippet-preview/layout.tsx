import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SERP Snippet Preview & Pixel Tool',
  description:
    'Test title tag pixel width (600px limit) and meta description truncation in real-time. Free Google search & social card simulator for SEO.',
  alternates: {
    canonical: 'https://analyzeserp.com/serp-snippet-preview',
  },
  openGraph: {
    title: 'SERP Snippet Preview & Pixel Tool | AnalyzeSERP',
    description:
      'Test title tag pixel width (600px limit) and meta description truncation in real-time. Free Google search & social card simulator for SEO.',
    url: 'https://analyzeserp.com/serp-snippet-preview',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Google SERP Snippet Preview Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'SERP Snippet Preview & Pixel Tool | AnalyzeSERP',
    description:
      'Test title tag pixel width (600px limit) and meta description truncation in real-time.',
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
      name: 'SERP Snippet Simulator',
      item: 'https://analyzeserp.com/serp-snippet-preview',
    },
  ],
};

export default function SerpSnippetPreviewLayout({ children }: { children: React.ReactNode }) {
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
