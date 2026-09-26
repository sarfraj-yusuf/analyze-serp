import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AnalyzeSERP & Founder Sarfraj Yusuf',
  description:
    'Learn about AnalyzeSERP, the high-speed deterministic SEO auditor with an on-demand AI writing co-pilot, created by Senior SEO Strategist Sarfraj Yusuf.',
  alternates: {
    canonical: 'https://analyzeserp.com/about',
  },
  openGraph: {
    title: 'About AnalyzeSERP & Founder Sarfraj Yusuf | AnalyzeSERP',
    description:
      'Learn about AnalyzeSERP, the high-speed deterministic SEO auditor with an on-demand AI writing co-pilot, created by Senior SEO Strategist Sarfraj Yusuf.',
    url: 'https://analyzeserp.com/about',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About AnalyzeSERP & Founder Sarfraj Yusuf',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About AnalyzeSERP & Founder Sarfraj Yusuf | AnalyzeSERP',
    description:
      'Learn about AnalyzeSERP, the high-speed deterministic SEO auditor with an on-demand AI writing co-pilot, created by Senior SEO Strategist Sarfraj Yusuf.',
    images: ['/og-image.jpg'],
  },
};

const aboutSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://analyzeserp.com/about#webpage',
    url: 'https://analyzeserp.com/about',
    name: 'About AnalyzeSERP & Founder Sarfraj Yusuf',
    description:
      'Learn about AnalyzeSERP, the high-speed deterministic SEO auditor with an on-demand AI writing co-pilot, created by Senior SEO Strategist Sarfraj Yusuf.',
    isPartOf: {
      '@id': 'https://analyzeserp.com/#website',
    },
    about: {
      '@id': 'https://analyzeserp.com/#organization',
    },
    mainEntity: {
      '@type': 'Person',
      '@id': 'https://analyzeserp.com/#founder',
      name: 'Sarfraj Yusuf',
      jobTitle: 'Founder & Senior SEO Strategist',
      url: 'https://analyzeserp.com/about',
      worksFor: {
        '@id': 'https://analyzeserp.com/#organization',
      },
      sameAs: [
        'https://twitter.com/sarfrajyusuf',
        'https://github.com/sarfraj-yusuf',
      ],
    },
  },
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
        name: 'About',
        item: 'https://analyzeserp.com/about',
      },
    ],
  },
];

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {children}
    </>
  );
}
