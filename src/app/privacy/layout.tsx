import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Compliance',
  description:
    'Read how AnalyzeSERP protects user privacy with transient serverless DOM parsing, zero URL tracking logs, and GDPR & CCPA compliance.',
  alternates: {
    canonical: 'https://analyzeserp.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Data Compliance | AnalyzeSERP',
    description:
      'Read how AnalyzeSERP protects user privacy with transient serverless DOM parsing, zero URL tracking logs, and GDPR & CCPA compliance.',
    url: 'https://analyzeserp.com/privacy',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy & Data Compliance | AnalyzeSERP',
    description:
      'Read how AnalyzeSERP protects user privacy with transient serverless DOM parsing, zero URL tracking logs, and GDPR & CCPA compliance.',
    images: ['/og-image.jpg'],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
