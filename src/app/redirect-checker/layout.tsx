import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free 301/302 Redirect Chain & Infinite Loop Inspector',
  description:
    'Trace multi-hop HTTP redirect chains, measure per-hop latency (ms), and eliminate infinite loops with step-by-step flowchart visualizer.',
  alternates: {
    canonical: 'https://analyzeserp.com/redirect-checker',
  },
  openGraph: {
    title: 'Free 301/302 Redirect Chain & Infinite Loop Inspector | AnalyzeSERP',
    description:
      'Trace multi-hop HTTP redirect chains, measure per-hop latency (ms), and eliminate infinite loops with step-by-step flowchart visualizer.',
    url: 'https://analyzeserp.com/redirect-checker',
  },
};

export default function RedirectCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
