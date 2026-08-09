import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact AnalyzeSERP Support & Feedback',
  description:
    'Get in touch with Sarfraj Yusuf and the AnalyzeSERP team for support, feature requests, or agency partnerships.',
  alternates: {
    canonical: 'https://analyzeserp.com/contact',
  },
  openGraph: {
    title: 'Contact AnalyzeSERP Support & Feedback | AnalyzeSERP',
    description:
      'Get in touch with Sarfraj Yusuf and the AnalyzeSERP team for support, feature requests, or agency partnerships.',
    url: 'https://analyzeserp.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
