import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Engineering Support Hub | AnalyzeSERP',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Engineering Support Hub | AnalyzeSERP',
    description:
      'Get in touch with Sarfraj Yusuf and the AnalyzeSERP engineering team for technical crawler support, agency partnerships, or feature feedback with sub-24h response SLAs.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
