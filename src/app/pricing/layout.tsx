import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & 100% Free Public Beta Access',
  description:
    'Explore AnalyzeSERP pricing plans. Enjoy 100% free unlimited competitor SEO audits, white-label vector PDF reports, and zero credit card required during Public Beta.',
  alternates: {
    canonical: 'https://analyzeserp.com/pricing',
  },
  openGraph: {
    title: 'Pricing & 100% Free Public Beta Access | AnalyzeSERP',
    description:
      'Explore AnalyzeSERP pricing plans. Enjoy 100% free unlimited competitor SEO audits, white-label vector PDF reports, and zero credit card required during Public Beta.',
    url: 'https://analyzeserp.com/pricing',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing & 100% Free Public Beta Access | AnalyzeSERP',
    description:
      'Explore AnalyzeSERP pricing plans. Enjoy 100% free unlimited competitor SEO audits, white-label vector PDF reports, and zero credit card required during Public Beta.',
    images: ['/og-image.jpg'],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
