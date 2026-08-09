import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Compliance',
  description:
    'Read how AnalyzeSERP protects user privacy and manages cookie data compliance.',
  alternates: {
    canonical: 'https://analyzeserp.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Data Compliance | AnalyzeSERP',
    description:
      'Read how AnalyzeSERP protects user privacy and manages cookie data compliance.',
    url: 'https://analyzeserp.com/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
