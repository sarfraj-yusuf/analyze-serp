import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Flesch Readability Score & Sentence Analyzer',
  description:
    'Analyze Flesch Reading Ease score, syllable distribution, and sentence length of your content in real-time with AnalyzeSERP.',
  alternates: {
    canonical: 'https://analyzeserp.com/readability',
  },
  openGraph: {
    title: 'Free Flesch Readability Score & Sentence Analyzer | AnalyzeSERP',
    description:
      'Analyze Flesch Reading Ease score, syllable distribution, and sentence length of your content in real-time.',
    url: 'https://analyzeserp.com/readability',
  },
};

export default function ReadabilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
