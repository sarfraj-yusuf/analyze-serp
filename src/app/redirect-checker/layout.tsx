import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirect Checker & HTTP Header Chain Auditor | AnalyzeSERP',
  description:
    'Audit 301 vs 302 HTTP status codes, trace redirect loops and redirect chains, and prevent PageRank link equity loss. Free online HTTP redirect inspector.',
  alternates: {
    canonical: 'https://analyzeserp.com/redirect-checker',
  },
  openGraph: {
    title: 'Redirect Checker & HTTP Header Chain Auditor | AnalyzeSERP',
    description:
      'Audit 301 vs 302 HTTP status codes, trace redirect loops and redirect chains, and prevent PageRank link equity loss. Free online HTTP redirect inspector.',
    url: 'https://analyzeserp.com/redirect-checker',
    type: 'website',
  },
};

export default function RedirectCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
