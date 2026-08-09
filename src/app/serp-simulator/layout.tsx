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
  },
};

export default function SerpSimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
