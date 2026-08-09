import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Free Public Beta Access',
  description:
    'Explore AnalyzeSERP pricing plans and enjoy 100% free unlimited competitor SEO audits during Public Beta.',
  alternates: {
    canonical: 'https://analyzeserp.com/pricing',
  },
  openGraph: {
    title: 'Pricing & Free Public Beta Access | AnalyzeSERP',
    description:
      'Explore AnalyzeSERP pricing plans and enjoy 100% free unlimited competitor SEO audits during Public Beta.',
    url: 'https://analyzeserp.com/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
