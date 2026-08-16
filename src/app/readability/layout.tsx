import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Readability Score Checker & Flesch Kincaid Auditor | AnalyzeSERP',
  description:
    'Audit content readability scores, analyze Flesch-Kincaid grade levels, detect passive voice ratio, and optimize article complexity for Google Helpful Content.',
  alternates: {
    canonical: 'https://analyzeserp.com/readability',
  },
  openGraph: {
    title: 'Readability Score Checker & Flesch Kincaid Auditor | AnalyzeSERP',
    description:
      'Audit content readability scores, analyze Flesch-Kincaid grade levels, detect passive voice ratio, and optimize article complexity for Google Helpful Content.',
    url: 'https://analyzeserp.com/readability',
    type: 'website',
  },
};

export default function ReadabilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
