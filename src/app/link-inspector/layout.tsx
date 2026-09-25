import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting to Link Inspector | AnalyzeSERP',
  description:
    'Extract internal and external links, check rel attributes, and audit anchor text distribution in 1 click.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://analyzeserp.com/affiliate-link-checker',
  },
};

export default function LinkInspectorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
