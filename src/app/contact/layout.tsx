import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Engineering Support Hub',
  description:
    'Get in touch with Sarfraj Yusuf and the AnalyzeSERP engineering team for technical crawler support, agency partnerships, or feature feedback with sub-24h response SLAs.',
  alternates: {
    canonical: 'https://analyzeserp.com/contact',
  },
  openGraph: {
    title: 'Contact & Engineering Support Hub | AnalyzeSERP',
    description:
      'Get in touch with Sarfraj Yusuf and the AnalyzeSERP engineering team for technical crawler support, agency partnerships, or feature feedback with sub-24h response SLAs.',
    url: 'https://analyzeserp.com/contact',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact & Engineering Support Hub | AnalyzeSERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Engineering Support Hub | AnalyzeSERP',
    description:
      'Get in touch with Sarfraj Yusuf and the AnalyzeSERP engineering team for technical crawler support, agency partnerships, or feature feedback with sub-24h response SLAs.',
    images: ['/og-image.jpg'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
