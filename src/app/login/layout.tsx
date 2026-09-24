import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to SEO Workspace',
  description:
    'Sign in to AnalyzeSERP to access your saved competitor audits, cloud snapshots, AI-powered recommendations, and white-label PDF reports.',
  alternates: {
    canonical: 'https://analyzeserp.com/login',
  },
  openGraph: {
    title: 'Sign In to SEO Workspace | AnalyzeSERP',
    description:
      'Sign in to AnalyzeSERP to access your saved competitor audits, cloud snapshots, AI-powered recommendations, and white-label PDF reports.',
    url: 'https://analyzeserp.com/login',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Sign In',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In to SEO Workspace | AnalyzeSERP',
    description:
      'Sign in to AnalyzeSERP to access your saved competitor audits, cloud snapshots, AI-powered recommendations, and white-label PDF reports.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
