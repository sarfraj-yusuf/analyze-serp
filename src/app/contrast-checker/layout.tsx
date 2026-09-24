import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Contrast Checker & WCAG Accessibility Auditor',
  description:
    'Test foreground and background text color contrast ratios against WCAG 2.1 AA and AAA standards. Free online color contrast checker for web accessibility.',
  alternates: {
    canonical: 'https://analyzeserp.com/contrast-checker',
  },
  openGraph: {
    title: 'Color Contrast Checker & WCAG Accessibility Auditor | AnalyzeSERP',
    description:
      'Test foreground and background text color contrast ratios against WCAG 2.1 AA and AAA standards.',
    url: 'https://analyzeserp.com/contrast-checker',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AnalyzeSERP Color Contrast Checker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@analyzeserp',
    creator: '@sarfrajyusuf',
    title: 'Color Contrast Checker & WCAG Accessibility Auditor | AnalyzeSERP',
    description:
      'Test text color contrast ratios against WCAG 2.1 AA and AAA standards.',
    images: ['/og-image.jpg'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://analyzeserp.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Color Contrast Checker',
      item: 'https://analyzeserp.com/contrast-checker',
    },
  ],
};

export default function ContrastCheckerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
