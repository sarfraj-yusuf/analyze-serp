import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AnalyzeSERP & Founder Sarfraj Yusuf',
  description:
    'Learn about AnalyzeSERP, the high-speed non-AI competitor SEO auditor created by Senior SEO Strategist Sarfraj Yusuf.',
  alternates: {
    canonical: 'https://analyzeserp.com/about',
  },
  openGraph: {
    title: 'About AnalyzeSERP & Founder Sarfraj Yusuf | AnalyzeSERP',
    description:
      'Learn about AnalyzeSERP, the high-speed non-AI competitor SEO auditor created by Senior SEO Strategist Sarfraj Yusuf.',
    url: 'https://analyzeserp.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
