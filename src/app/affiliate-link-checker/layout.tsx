import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Link Checker & Rel Sponsored Auditor | AnalyzeSERP',
  description:
    'Audit outbound links, detect Amazon, CJ & ShareASale parameters, and check Google rel="sponsored" link spam compliance. Free SEO link inspector.',
  alternates: {
    canonical: 'https://analyzeserp.com/affiliate-link-checker',
  },
  openGraph: {
    title: 'Affiliate Link Checker & Rel Sponsored Auditor | AnalyzeSERP',
    description:
      'Audit outbound links, detect Amazon, CJ & ShareASale parameters, and check Google rel="sponsored" link spam compliance. Free SEO link inspector.',
    url: 'https://analyzeserp.com/affiliate-link-checker',
    type: 'website',
  },
};

export default function AffiliateLinkCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
