import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Link & Sponsored Tag Checker',
  description:
    'Audit outbound links, detect Amazon, CJ & ShareASale parameters, and check Google rel="sponsored" link spam compliance. Free SEO link inspector.',
  alternates: {
    canonical: 'https://analyzeserp.com/affiliate-link-checker',
  },
  openGraph: {
    title: 'Affiliate Link & Sponsored Tag Checker | AnalyzeSERP',
    description:
      'Audit outbound links, detect Amazon, CJ & ShareASale parameters, and check Google rel="sponsored" link spam compliance. Free SEO link inspector.',
    url: 'https://analyzeserp.com/affiliate-link-checker',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Affiliate Link Checker | AnalyzeSERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Link & Sponsored Tag Checker | AnalyzeSERP',
    description:
      'Audit outbound links, detect Amazon, CJ & ShareASale parameters, and check Google rel="sponsored" link spam compliance. Free SEO link inspector.',
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
      name: 'Affiliate Link Checker',
      item: 'https://analyzeserp.com/affiliate-link-checker',
    },
  ],
};

export default function AffiliateLinkCheckerLayout({ children }: { children: React.ReactNode }) {
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
