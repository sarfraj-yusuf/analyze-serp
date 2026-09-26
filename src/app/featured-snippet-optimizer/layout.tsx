import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Featured Snippet & Position Zero Optimizer',
  description:
    'Audit Google Position 0 featured snippet opportunities, generate high-converting snippet bait definitions (paragraphs, lists, tables), and classify search intent.',
  alternates: {
    canonical: 'https://analyzeserp.com/featured-snippet-optimizer',
  },
  openGraph: {
    title: 'Featured Snippet & Position Zero Optimizer | AnalyzeSERP',
    description:
      'Audit Google Position 0 featured snippet opportunities, generate high-converting snippet bait definitions (paragraphs, lists, tables), and classify search intent.',
    url: 'https://analyzeserp.com/featured-snippet-optimizer',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Featured Snippet Optimizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Featured Snippet & Position Zero Optimizer | AnalyzeSERP',
    description:
      'Audit Google Position 0 featured snippet opportunities, generate high-converting snippet bait definitions (paragraphs, lists, tables), and classify search intent.',
    images: ['/og-image.jpg'],
  },
};

const toolSchema = [
  {
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
        name: 'Featured Snippet Optimizer',
        item: 'https://analyzeserp.com/featured-snippet-optimizer',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Google Featured Snippet Optimizer & Position 0 Bait Studio',
    url: 'https://analyzeserp.com/featured-snippet-optimizer',
    description:
      'Audit Google Position 0 featured snippet opportunities, generate high-converting snippet bait definitions, and classify search intent.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'AnalyzeSERP',
      url: 'https://analyzeserp.com',
    },
  },
];

export default function FeaturedSnippetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      {children}
    </>
  );
}
