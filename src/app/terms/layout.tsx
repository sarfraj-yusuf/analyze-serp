import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & Usage Agreement',
  description:
    'Read the Terms of Service and user agreement for AnalyzeSERP competitor SEO audit suite.',
  alternates: {
    canonical: 'https://analyzeserp.com/terms',
  },
  openGraph: {
    title: 'Terms of Service & Usage Agreement | AnalyzeSERP',
    description:
      'Read the Terms of Service and user agreement for AnalyzeSERP competitor SEO audit suite.',
    url: 'https://analyzeserp.com/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
