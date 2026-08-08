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
    default: "Free Competitor SEO Analysis Tool | AnalyzeSERP",
    template: "%s | AnalyzeSERP",
  },
  description:
    "Analyze competitor pages for free. Compare title tags, meta descriptions, headings, keywords, readability, links, images, and technical SEO signals in one fast on-page SEO audit.",
  keywords: [
    "AnalyzeSERP",
    "competitor SEO analysis tool",
    "free SEO audit tool",
    "on-page SEO analyzer",
    "keyword gap analysis",
    "title tag analyzer",
    "SERP simulator",
    "technical SEO checker",
  ],
  authors: [{ name: "Sarfraj Yusuf", url: "https://analyzeserp.com/about" }],
  creator: "AnalyzeSERP",
  publisher: "AnalyzeSERP",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Free Competitor SEO Analysis Tool | AnalyzeSERP",
    description:
      "Analyze competitor pages for free. Compare title tags, meta descriptions, headings, keywords, readability, links, images, and technical SEO signals in one fast on-page SEO audit.",
    url: "https://analyzeserp.com",
    siteName: "AnalyzeSERP",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AnalyzeSERP — Free Competitor SEO Analysis Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Competitor SEO Analysis Tool | AnalyzeSERP",
    description:
      "Analyze competitor pages for free. Compare title tags, meta descriptions, headings, keywords, readability, links, images, and technical SEO signals in one fast on-page SEO audit.",
    creator: "@sarfrajyusuf",
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

import { ClientFeedbackWrapper } from "@/components/ClientFeedbackWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200`}
      >
        <ClientFeedbackWrapper>{children}</ClientFeedbackWrapper>
      </body>
    </html>
  );
}
