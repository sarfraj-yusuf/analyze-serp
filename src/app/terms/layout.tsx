import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & Usage Agreement',
  description:
    'Read the Terms of Service and agency usage agreement for AnalyzeSERP, covering 100% free Public Beta terms, commercial white-label PDF rights, and fair usage policies.',
  alternates: {
    canonical: 'https://analyzeserp.com/terms',
  },
  openGraph: {
    title: 'Terms of Service & Usage Agreement | AnalyzeSERP',
    description:
      'Read the Terms of Service and agency usage agreement for AnalyzeSERP, covering 100% free Public Beta terms, commercial white-label PDF rights, and fair usage policies.',
    url: 'https://analyzeserp.com/terms',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service & Usage Agreement | AnalyzeSERP',
    description:
      'Read the Terms of Service and agency usage agreement for AnalyzeSERP, covering 100% free Public Beta terms, commercial white-label PDF rights, and fair usage policies.',
    images: ['/og-image.jpg'],
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
