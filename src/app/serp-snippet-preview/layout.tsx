import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google SERP Snippet Preview Tool & Pixel Checker | AnalyzeSERP',
  description:
    'Test title tag pixel width (600px limit) and meta description truncation in real-time. Free Google search & social card simulator for SEO.',
  alternates: {
    canonical: 'https://analyzeserp.com/serp-snippet-preview',
  },
  openGraph: {
    title: 'Google SERP Snippet Preview Tool & Pixel Checker | AnalyzeSERP',
    description:
      'Test title tag pixel width (600px limit) and meta description truncation in real-time. Free Google search & social card simulator for SEO.',
    url: 'https://analyzeserp.com/serp-snippet-preview',
    type: 'website',
  },
};

export default function SerpSnippetPreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
