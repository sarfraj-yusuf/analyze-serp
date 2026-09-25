import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting to SERP Snippet Preview | AnalyzeSERP',
  description:
    'Simulate how your URLs look when shared on Google, Facebook, Twitter/X, and Open Graph previews.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://analyzeserp.com/serp-snippet-preview',
  },
};

export default function SerpSimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
