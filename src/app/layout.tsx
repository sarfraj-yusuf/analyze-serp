import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  adjustFontFallback: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://analyzeserp.com"),
  title: {
    default: "AnalyzeSERP — Free On-Page Competitor Audit & SERP Intelligence",
    template: "%s | AnalyzeSERP",
  },
  description:
    "AnalyzeSERP is a high-speed non-AI competitor SEO auditor. Cross-compare competitor SERPs, detect keyword gaps, calculate Flesch readability scores, inspect affiliate link footprints, and export white-label PDF reports.",
  keywords: [
    "AnalyzeSERP",
    "SERP analyzer",
    "competitor SEO audit",
    "keyword gap matrix",
    "Flesch readability score",
    "SERP simulator",
    "affiliate link inspector",
    "white label PDF SEO report",
    "on-page SEO analyzer",
    "site speed auditor",
  ],
  authors: [{ name: "AnalyzeSERP Team", url: "https://analyzeserp.com" }],
  creator: "AnalyzeSERP",
  publisher: "AnalyzeSERP",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "AnalyzeSERP — Competitor SERP & Content Audit Tool",
    description:
      "Cross-compare competitor pages, extract missing keyword gaps, analyze readability grade level, inspect affiliate link footprints, and export white-label PDF reports.",
    url: "https://analyzeserp.com",
    siteName: "AnalyzeSERP",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AnalyzeSERP — Competitor SERP & Content Audit Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AnalyzeSERP — Competitor SERP & Content Audit Tool",
    description:
      "Audit competitor search results in seconds without AI latency. Free keyword gap matrix, readability analyzer & PDF export.",
    creator: "@analyzeserp",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AnalyzeSERP",
  "url": "https://analyzeserp.com",
  "description": "High-speed non-AI competitor SEO auditor and SERP intelligence suite.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "author": {
    "@type": "Organization",
    "name": "AnalyzeSERP",
    "url": "https://analyzeserp.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}
