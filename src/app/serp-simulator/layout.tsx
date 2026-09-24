import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free SERP & Social Card Simulator',
  description:
    'Simulate how your URLs look when shared on Google, Facebook, Twitter/X, and Open Graph previews.',
  alternates: {
    canonical: 'https://analyzeserp.com/serp-simulator',
  },
  openGraph: {
    title: 'Free SERP & Social Card Simulator | AnalyzeSERP',
    description:
      'Simulate how your URLs look when shared on Google, Facebook, Twitter/X, and Open Graph previews.',
    url: 'https://analyzeserp.com/serp-simulator',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free SERP & Social Card Simulator | AnalyzeSERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SERP & Social Card Simulator | AnalyzeSERP',
    description:
      'Simulate how your URLs look when shared on Google, Facebook, Twitter/X, and Open Graph previews.',
    images: ['/og-image.jpg'],
  },
};

export default function SerpSimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
