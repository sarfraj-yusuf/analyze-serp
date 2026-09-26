import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Internal Link & Anchor Text Mapper',
  description:
    'Map internal link architecture, destination target hubs, and 5-tier anchor text distribution. Detect over-optimization and uncover competitor anchor gaps.',
  alternates: {
    canonical: 'https://analyzeserp.com/internal-link-mapper',
  },
  openGraph: {
    title: 'Internal Link & Anchor Text Mapper | AnalyzeSERP',
    description:
      'Map internal link architecture, destination target hubs, and 5-tier anchor text distribution. Detect over-optimization and uncover competitor anchor gaps.',
    url: 'https://analyzeserp.com/internal-link-mapper',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Internal Link Topology Mapper',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Internal Link & Anchor Text Mapper | AnalyzeSERP',
    description:
      'Map internal link architecture, destination target hubs, and 5-tier anchor text distribution.',
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
        name: 'Internal Link Topology Mapper',
        item: 'https://analyzeserp.com/internal-link-mapper',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Internal Link Topology Mapper & PageRank Silo Analyzer',
    url: 'https://analyzeserp.com/internal-link-mapper',
    description:
      'Map internal link architecture, destination target hubs, and 5-tier anchor text distribution.',
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

export default function InternalLinkMapperLayout({ children }: { children: React.ReactNode }) {
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
