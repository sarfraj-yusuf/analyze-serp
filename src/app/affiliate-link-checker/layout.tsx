import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Affiliate Link Inspector & Compliance Checker',
  description:
    'Audit affiliate referral parameters, rel="sponsored" and rel="nofollow" attributes, and detect broken affiliate links in real-time.',
  alternates: {
    canonical: 'https://analyzeserp.com/affiliate-link-checker',
  },
  openGraph: {
    title: 'Free Affiliate Link Inspector & Compliance Checker | AnalyzeSERP',
    description:
      'Audit affiliate referral parameters, rel="sponsored" and rel="nofollow" attributes, and detect broken affiliate links in real-time.',
    url: 'https://analyzeserp.com/affiliate-link-checker',
  },
};

export default function AffiliateLinkCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
