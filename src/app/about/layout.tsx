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

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
