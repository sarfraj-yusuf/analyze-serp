import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live SEO Content Scratchpad & Real-Time Content Scorer',
  description:
    'Real-time lexical scoring studio with competitor keyword checklist, keyword density guard, and Flesch reading ease analyzer. Write rank-ready content fast.',
  alternates: {
    canonical: 'https://analyzeserp.com/content-scratchpad',
  },
  openGraph: {
    title: 'Live SEO Content Scratchpad & Real-Time Content Scorer | AnalyzeSERP',
    description:
      'Real-time lexical scoring studio with competitor keyword checklist, keyword density guard, and Flesch reading ease analyzer. Write rank-ready content fast.',
    url: 'https://analyzeserp.com/content-scratchpad',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Live SEO Content Scratchpad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Live SEO Content Scratchpad & Real-Time Content Scorer | AnalyzeSERP',
    description:
      'Real-time lexical scoring studio with competitor keyword checklist, keyword density guard, and Flesch reading ease analyzer.',
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
        name: 'Live SEO Content Scratchpad',
        item: 'https://analyzeserp.com/content-scratchpad',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Live SEO Content Scratchpad & Real-Time Lexical Density Scorer',
    url: 'https://analyzeserp.com/content-scratchpad',
    description:
      'Real-time lexical scoring studio with competitor keyword checklist, keyword density guard, and Flesch reading ease analyzer.',
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

export default function ContentScratchpadLayout({ children }: { children: React.ReactNode }) {
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
