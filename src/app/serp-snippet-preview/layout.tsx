import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Google SERP Snippet Preview Generator',
  description:
    'Preview how your Title Tags and Meta Descriptions look in Google Search Desktop and Mobile results in real-time.',
  alternates: {
    canonical: 'https://analyzeserp.com/serp-snippet-preview',
  },
  openGraph: {
    title: 'Free Google SERP Snippet Preview Generator | AnalyzeSERP',
    description:
      'Preview how your Title Tags and Meta Descriptions look in Google Search Desktop and Mobile results in real-time.',
    url: 'https://analyzeserp.com/serp-snippet-preview',
  },
};

export default function SerpSnippetPreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
