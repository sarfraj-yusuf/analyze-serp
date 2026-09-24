import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free On-Page Link Inspector & Anchor Auditor',
  description:
    'Extract internal and external links, check rel attributes, and audit anchor text distribution in 1 click.',
  alternates: {
    canonical: 'https://analyzeserp.com/link-inspector',
  },
  openGraph: {
    title: 'Free On-Page Link Inspector & Anchor Auditor | AnalyzeSERP',
    description:
      'Extract internal and external links, check rel attributes, and audit anchor text distribution in 1 click.',
    url: 'https://analyzeserp.com/link-inspector',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free On-Page Link Inspector | AnalyzeSERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free On-Page Link Inspector & Anchor Auditor | AnalyzeSERP',
    description:
      'Extract internal and external links, check rel attributes, and audit anchor text distribution in 1 click.',
    images: ['/og-image.jpg'],
  },
};

export default function LinkInspectorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
