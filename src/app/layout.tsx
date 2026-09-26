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
    default: "Competitor SEO Audit Tool – 100% Free | AnalyzeSERP",
    template: "%s | AnalyzeSERP",
  },
  description:
    "Run a free competitor SEO audit instantly. Compare titles, meta tags, headings, keywords, links & technical SEO — no signup, no credit card required.",
  keywords: [
    "AnalyzeSERP",
    "competitor SEO analysis tool",
    "competitor SEO audit tool",
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
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: "Competitor SEO Audit Tool – 100% Free | AnalyzeSERP",
    description:
      "Run a free competitor SEO audit instantly. Compare titles, meta tags, headings, keywords, links & technical SEO — no signup, no credit card required.",
    url: "https://analyzeserp.com",
    siteName: "AnalyzeSERP",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AnalyzeSERP — Free Competitor SEO Audit Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@analyzeserp",
    title: "Competitor SEO Audit Tool – 100% Free | AnalyzeSERP",
    description:
      "Run a free competitor SEO audit instantly. Compare titles, meta tags, headings, keywords, links & technical SEO — no signup, no credit card required.",
    creator: "@sarfrajyusuf",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://analyzeserp.com",
    types: {
      'application/rss+xml': 'https://analyzeserp.com/rss.xml',
    },
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://analyzeserp.com/#organization",
      "name": "AnalyzeSERP",
      "url": "https://analyzeserp.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://analyzeserp.com/#logo",
        "url": "https://analyzeserp.com/logo.svg",
        "contentUrl": "https://analyzeserp.com/logo.svg",
        "caption": "AnalyzeSERP Logo"
      },
      "image": {
        "@id": "https://analyzeserp.com/#logo"
      },
      "founder": {
        "@type": "Person",
        "@id": "https://analyzeserp.com/#founder",
        "name": "Sarfraj Yusuf",
        "jobTitle": "Founder & Senior SEO Strategist",
        "url": "https://analyzeserp.com/about",
        "sameAs": [
          "https://twitter.com/sarfrajyusuf",
          "https://github.com/sarfraj-yusuf"
        ]
      },
      "sameAs": [
        "https://twitter.com/analyzeserp",
        "https://twitter.com/sarfrajyusuf",
        "https://github.com/sarfraj-yusuf/analyze-serp"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://analyzeserp.com/#website",
      "url": "https://analyzeserp.com",
      "name": "AnalyzeSERP",
      "description": "Deterministic Competitor SEO Analysis & SERP Benchmarking Platform",
      "publisher": {
        "@id": "https://analyzeserp.com/#organization"
      },
      "inLanguage": "en-US"
    },
    {
      "@type": "WebApplication",
      "@id": "https://analyzeserp.com/#webapp",
      "url": "https://analyzeserp.com",
      "name": "AnalyzeSERP Competitor SEO Analyzer",
      "applicationCategory": "SEOApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires HTML5 and JavaScript",
      "description": "High-speed deterministic competitor SEO auditor with real-time DOM parsing, keyword gap analysis, and content benchmarking.",
      "author": {
        "@id": "https://analyzeserp.com/#founder"
      },
      "provider": {
        "@id": "https://analyzeserp.com/#organization"
      },
      "offers": {
        "@type": "Offer",
        "@id": "https://analyzeserp.com/#free-offer",
        "price": "0.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@id": "https://analyzeserp.com/#organization"
        }
      }
    }
  ]
};

import { ClientFeedbackWrapper } from "@/components/ClientFeedbackWrapper";
import { AuthProvider } from "@/components/AuthProvider";

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
        <AuthProvider>
          <ClientFeedbackWrapper>{children}</ClientFeedbackWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
