export interface PlatformFixGuide {
  platform: 'nextjs' | 'wordpress' | 'server';
  platformLabel: string;
  description: string;
  codeSnippet?: string;
  codeLanguage?: string;
  instructions: string[];
}

export interface SpeedAuditFixGuide {
  auditId: string;
  title: string;
  category: 'images' | 'javascript' | 'css' | 'server' | 'fonts' | 'dom' | 'performance';
  categoryLabel: string;
  severity: 'high' | 'medium' | 'low';
  whyItMatters: string;
  estimatedSavingsDescription: string;
  guides: PlatformFixGuide[];
}

export const SPEED_FIX_GUIDES_MAP: Record<string, SpeedAuditFixGuide> = {
  'render-blocking-resources': {
    auditId: 'render-blocking-resources',
    title: 'Eliminate Render-Blocking Resources',
    category: 'javascript',
    categoryLabel: 'JavaScript & CSS',
    severity: 'high',
    whyItMatters:
      'Browsers pause page rendering while downloading and parsing synchronous <script> and <link rel="stylesheet"> tags in the <head>. This causes a blank screen and directly increases First Contentful Paint (FCP) and Largest Contentful Paint (LCP).',
    estimatedSavingsDescription: 'Reduces initial paint delay by 500ms to 2.5s.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / React',
        description: 'Use the Next.js Script component with non-blocking strategies and inline critical styling.',
        codeLanguage: 'tsx',
        codeSnippet: `// 1. Move third-party scripts to next/script with afterInteractive or lazyOnload
import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <>
      {children}
      {/* Non-critical analytics / chat widgets */}
      <Script 
        src="https://example.com/analytics.js" 
        strategy="afterInteractive" 
      />
    </>
  );
}

// 2. Dynamically import heavy interactive client components
import dynamic from 'next/dynamic';
const HeavyModal = dynamic(() => import('@/components/HeavyModal'), {
  ssr: false,
  loading: () => <div className="animate-pulse" />,
});`,
        instructions: [
          'Replace standard <script> tags with next/script and strategy="afterInteractive".',
          'Split large modals, sliders, and heavy client libraries using dynamic imports (next/dynamic).',
          'Ensure global CSS is imported exclusively in Root Layout.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Configure automated script deferment and critical CSS generation.',
        codeLanguage: 'php',
        codeSnippet: `// In your theme functions.php - add defer attribute to non-essential scripts
add_filter('script_loader_tag', function($tag, $handle) {
    if (is_admin()) return $tag;
    // Exclude jQuery core if plugins depend on it
    if ($handle === 'jquery-core') return $tag;
    return str_replace(' src=', ' defer src=', $tag);
}, 10, 2);`,
        instructions: [
          'Install a trusted optimization plugin like WP Rocket, LiteSpeed Cache, or Autoptimize.',
          'Enable "Load JavaScript deferred" and "Delay JavaScript execution" for non-critical scripts.',
          'Turn on "Generate Critical CSS" to render above-the-fold content immediately.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'Nginx / Apache Server',
        description: 'Enable HTTP/2 or HTTP/3 multiplexing so assets download concurrently without head-of-line blocking.',
        codeLanguage: 'nginx',
        codeSnippet: `# In your Nginx server block:
server {
    listen 443 ssl http2; # HTTP/2 multiplexes concurrent stylesheet & script requests
    server_name analyzeserp.com;

    # Preload critical CSS assets
    location / {
        add_header Link "</styles/main.css>; rel=preload; as=style" always;
    }
}`,
        instructions: [
          'Verify HTTP/2 or HTTP/3 is active on your web server or CDN (Cloudflare / Hostinger).',
          'Set up Link header preloading for the primary stylesheet.',
        ],
      },
    ],
  },

  'modern-image-formats': {
    auditId: 'modern-image-formats',
    title: 'Serve Images in Next-Gen Formats (WebP / AVIF)',
    category: 'images',
    categoryLabel: 'Images & Media',
    severity: 'high',
    whyItMatters:
      'Legacy formats like JPEG and PNG are 25% to 50% larger than modern formats like WebP and AVIF with zero discernible loss in visual quality. Oversized images are the #1 cause of poor LCP scores.',
    estimatedSavingsDescription: 'Reduces image transfer payload by 30%–70%.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / React',
        description: 'Use next/image with AVIF and WebP format auto-negotiation enabled in next.config.mjs.',
        codeLanguage: 'tsx',
        codeSnippet: `// 1. In next.config.mjs:
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // Browser automatically receives smallest supported format
  },
};
export default nextConfig;

// 2. In your React component:
import Image from 'next/image';

export function HeroImage() {
  return (
    <Image
      src="/hero-banner.jpg"
      alt="SEO Competitor Audit Dashboard"
      width={1200}
      height={630}
      priority // Add priority only for above-the-fold hero image (improves LCP)
      className="rounded-2xl shadow-xl w-full h-auto"
    />
  );
}`,
        instructions: [
          'Verify next.config.mjs includes formats: [\'image/avif\', \'image/webp\'].',
          'Use priority property ONLY on the single largest above-the-fold image.',
          'Never use unoptimized standard <img> tags for static hero assets.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Automatically convert uploads to WebP/AVIF using a dedicated image engine.',
        codeLanguage: 'nginx',
        codeSnippet: `# Nginx WebP content-negotiation fallback
map $http_accept $webp_suffix {
    default "";
    "~*webp" ".webp";
}
location ~* ^(/.+)\.(jpe?g|png)$ {
    add_header Vary Accept;
    try_files $1$webp_suffix $uri =404;
}`,
        instructions: [
          'Install Smush, ShortPixel, or WebP Express.',
          'Enable "Automatic WebP conversion on upload".',
          'Turn on "Serve WebP via <picture> tags or .htaccess rewrite rules".',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'CDN / Cloudflare',
        description: 'Enable Polish / Image Resizing at the edge CDN level.',
        codeLanguage: 'text',
        codeSnippet: `# Cloudflare Dashboard:
1. Navigate to Speed > Optimization > Content Optimization
2. Enable "Polish" -> Select "Lossy" or "Lossless"
3. Check "WebP" delivery checkbox
4. Enable "Mirage" for mobile device detection`,
        instructions: [
          'Turn on Cloudflare Polish with WebP support.',
          'If using AWS S3 / CloudFront, use an AWS Lambda@Edge function for Sharp WebP transformation.',
        ],
      },
    ],
  },

  'uses-optimized-images': {
    auditId: 'uses-optimized-images',
    title: 'Efficiently Encode and Compress Images',
    category: 'images',
    categoryLabel: 'Images & Media',
    severity: 'medium',
    whyItMatters:
      'Uncompressed images waste bandwidth and delay mobile browser parsing, increasing total download time and data costs.',
    estimatedSavingsDescription: 'Saves between 50 KiB and 500+ KiB per asset.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / React',
        description: 'Provide quality parameter and correct sizes attribute to prevent loading 4K images on mobile.',
        codeLanguage: 'tsx',
        codeSnippet: `<Image
  src="/feature-preview.png"
  alt="Feature Interface"
  width={800}
  height={500}
  quality={80} // 80 provides indistinguishable visual quality with 40% size reduction
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  loading="lazy"
/>`,
        instructions: [
          'Set quality={80} (default is 75 in Next.js).',
          'Always supply the sizes attribute so mobile devices download the correct resolution breakpoint.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Batch compress existing media library images with 82% quality compression.',
        codeLanguage: 'text',
        codeSnippet: `1. Go to Plugins > Add New > Install "Smush" or "TinyPNG"
2. Run "Bulk Smush" to compress existing uploads
3. Set maximum image upload dimensions to 1920px max width`,
        instructions: [
          'Set maximum upload dimensions in WordPress media settings to prevent huge 6000px camera uploads.',
          'Run a bulk optimization pass across your media library.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'CLI / Build Script',
        description: 'Run Sharp or imagemin in your build pipeline to pre-compress public assets.',
        codeLanguage: 'bash',
        codeSnippet: `# Compress public/ assets before deployment
npx sharp-cli -i ./public/images/*.png -o ./public/images/optimized/ -q 80 --webp`,
        instructions: [
          'Add a pre-commit or pre-build script to compress images in public/.',
        ],
      },
    ],
  },

  'unused-javascript': {
    auditId: 'unused-javascript',
    title: 'Reduce Unused JavaScript & Code Splitting',
    category: 'javascript',
    categoryLabel: 'JavaScript & CSS',
    severity: 'high',
    whyItMatters:
      'Shipping large JavaScript bundles containing uncalled code blocks the browser main thread during decompression and compilation, creating high Total Blocking Time (TBT) and poor Interaction to Next Paint (INP).',
    estimatedSavingsDescription: 'Can improve INP responsiveness by 100ms–400ms.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / React',
        description: 'Inspect bundle dependencies and dynamically load heavy third-party packages.',
        codeLanguage: 'tsx',
        codeSnippet: `// Audit bundle sizes using @next/bundle-analyzer
// In your component, dynamically import heavy libraries only when requested:
import { useState } from 'react';

export function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    // Dynamically loads jspdf ONLY when user clicks export (saves 300kB from initial page bundle)
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text('SEO Audit Report', 10, 10);
    doc.save('audit.pdf');
    setExporting(false);
  };

  return <button onClick={handleExportPdf}>Export PDF</button>;
}`,
        instructions: [
          'Dynamic import heavy client libraries like chart.js, jspdf, or syntax highlighters.',
          'Avoid barrel exports (`import { Icon } from "lucide-react"`) if bundler tree-shaking is disabled.',
          'Use React Suspense to isolate slower UI sections.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Deregister unnecessary plugin scripts from pages where they are not used.',
        codeLanguage: 'php',
        codeSnippet: `// Disable contact form scripts on pages without contact forms
add_action('wp_enqueue_scripts', function() {
    if (!is_page('contact')) {
        wp_dequeue_script('contact-form-7');
        wp_dequeue_style('contact-form-7');
    }
}, 99);`,
        instructions: [
          'Use a plugin like "Asset CleanUp" or "Perfmatters" to selectively unload unused plugin scripts.',
          'Remove inactive plugins rather than just deactivating them.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'Build / Bundler',
        description: 'Analyze production webpack/rollup chunks to eliminate duplicate vendor libraries.',
        codeLanguage: 'bash',
        codeSnippet: `# Run bundle analyzer in Next.js
ANALYZE=true npm run build`,
        instructions: [
          'Inspect the largest green and blue chunks in bundle-analyzer.',
          'Replace heavy dependencies with lightweight alternatives (e.g. date-fns instead of moment.js).',
        ],
      },
    ],
  },

  'unused-css-rules': {
    auditId: 'unused-css-rules',
    title: 'Reduce Unused CSS & Purge Unreferenced Rules',
    category: 'css',
    categoryLabel: 'JavaScript & CSS',
    severity: 'medium',
    whyItMatters:
      'Browsers construct the CSSOM by downloading and parsing every CSS rule before rendering any visible elements. Large unused frameworks delay First Contentful Paint.',
    estimatedSavingsDescription: 'Reduces CSS payload by 40%–90%.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / Tailwind CSS',
        description: 'Ensure Tailwind CSS v4 or purge configuration scans all content templates.',
        codeLanguage: 'css',
        codeSnippet: `/* Tailwind CSS automatically tree-shakes unused classes in production */
@import "tailwindcss";

/* Keep custom styles scoped to CSS Modules or scoped utility classes */`,
        instructions: [
          'Ensure your template path configuration includes all src/app and src/components paths.',
          'Avoid global CSS files that define hundreds of legacy unused selector styles.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Enable "Remove Unused CSS" (RUCSS) in WP Rocket or LiteSpeed Cache.',
        codeLanguage: 'text',
        codeSnippet: `1. Open WP Rocket > File Optimization > CSS Files
2. Check "Remove Unused CSS"
3. Clear cache and run audit to verify separate used-css file generation`,
        instructions: [
          'Turn on "Remove Unused CSS" in your caching plugin.',
          'Whitelist any dynamic popup or navigation selectors to prevent missing styling.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'Server / Build',
        description: 'Process raw CSS with PurgeCSS in your build step.',
        codeLanguage: 'bash',
        codeSnippet: `npx purgecss --css ./styles/*.css --content ./src/**/*.tsx -o ./public/cleaned.css`,
        instructions: [
          'Verify PurgeCSS preserves active UI classes and dynamic states.',
        ],
      },
    ],
  },

  'server-response-time': {
    auditId: 'server-response-time',
    title: 'Reduce Initial Server Response Time (TTFB < 200ms)',
    category: 'server',
    categoryLabel: 'Server & Caching',
    severity: 'high',
    whyItMatters:
      'Time to First Byte (TTFB) measures how long the browser waits before receiving the first byte of HTML. Slow TTFB (>600ms) starves every subsequent asset request and directly penalizes SEO rankings.',
    estimatedSavingsDescription: 'Cuts initial server response latency by 200ms–1500ms.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / Node.js',
        description: 'Implement Edge Caching, Incremental Static Regeneration (ISR), and database query caching.',
        codeLanguage: 'tsx',
        codeSnippet: `// 1. Enable Static or ISR revalidation for marketing & blog pages
export const revalidate = 3600; // Cache page for 1 hour at edge CDN

// 2. In Route Handlers, set Cache-Control headers:
export async function GET() {
  const data = await getCachedData();
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}`,
        instructions: [
          'Avoid doing slow synchronous database queries directly inside initial page renderers.',
          'Use stale-while-revalidate or ISR (revalidate) for content that does not change every millisecond.',
          'Ensure database connection pooling has connection limits suited to your host (e.g. max 10 for Hostinger).',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Enable Full-Page Object Caching (Redis/Memcached) and OPCache.',
        codeLanguage: 'text',
        codeSnippet: `1. In Hostinger hPanel > Advanced > PHP Configuration:
   - Enable "OPcache"
2. Install "Redis Object Cache" plugin
3. Verify page response headers return "X-Cache: HIT"`,
        instructions: [
          'Enable PHP OPcache in server settings.',
          'Use Redis or Memcached object caching to reduce repeated MySQL database queries.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'CDN & Reverse Proxy',
        description: 'Put Cloudflare or Hostinger CDN edge caching in front of your server.',
        codeLanguage: 'nginx',
        codeSnippet: `# In Nginx config:
fastcgi_cache_path /etc/nginx/cache levels=1:2 keys_zone=MYAPP:100m inactive=60m;
fastcgi_cache_key "$scheme$request_method$host$request_uri";

location ~ \.php$ {
    fastcgi_cache MYAPP;
    fastcgi_cache_valid 200 60m;
    add_header X-Cache-Status $upstream_cache_status;
}`,
        instructions: [
          'Enable Edge Page Caching on Cloudflare (Cache Rules -> Cache Everything for static pages).',
          'Ensure DNS records use Cloudflare or modern fast Anycast DNS.',
        ],
      },
    ],
  },

  'uses-long-cache-ttl': {
    auditId: 'uses-long-cache-ttl',
    title: 'Serve Static Assets with an Efficient Cache Policy',
    category: 'server',
    categoryLabel: 'Server & Caching',
    severity: 'medium',
    whyItMatters:
      'Static assets (fonts, images, CSS, JavaScript) that rarely change should be cached in the visitor\'s browser for up to 1 year. Without long cache TTLs, returning visitors re-download the entire page on every click.',
    estimatedSavingsDescription: 'Makes second-page loads 80%–90% faster.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / Node.js',
        description: 'Next.js automatically hashes static chunks with 1-year immutable caching. For public/ assets, configure headers in next.config.mjs.',
        codeLanguage: 'javascript',
        codeSnippet: `// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(fonts|images|icons)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
export default nextConfig;`,
        instructions: [
          'Add custom headers in next.config.mjs for your public static directory folders.',
          'Never put no-cache on static SVG icons or fonts.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress (.htaccess)',
        description: 'Add browser caching headers in .htaccess.',
        codeLanguage: 'apache',
        codeSnippet: `<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>`,
        instructions: [
          'Add ExpiresByType directives to your root .htaccess file.',
          'Verify browser DevTools Network tab displays (from disk cache) for returning visitors.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'Nginx',
        description: 'Set immutable cache-control headers for static extensions.',
        codeLanguage: 'nginx',
        codeSnippet: `location ~* \.(css|js|woff2|webp|png|jpg|svg|ico)$ {
    expires 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}`,
        instructions: [
          'Add a static extension location block in your Nginx site configuration.',
          'Reload Nginx with: sudo nginx -s reload.',
        ],
      },
    ],
  },

  'dom-size': {
    auditId: 'dom-size',
    title: 'Avoid an Excessive DOM Size (< 800 Nodes)',
    category: 'dom',
    categoryLabel: 'DOM & Rendering',
    severity: 'medium',
    whyItMatters:
      'A deep DOM tree (>800 nodes or depth >32) increases browser memory usage, causes layout recalculation thrashing, and hurts Interaction to Next Paint (INP) during scrolling and typing.',
    estimatedSavingsDescription: 'Reduces memory usage and layout recalculation latency.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / React',
        description: 'Paginate long tables, virtualize massive lists, and remove redundant wrapper divs.',
        codeLanguage: 'tsx',
        codeSnippet: `// Instead of rendering 500 rows at once in the DOM:
// Use pagination or windowing:
import { useState } from 'react';

export function PaginatedList({ items }) {
  const [page, setPage] = useState(1);
  const pageSize = 20; // Only keep 20 elements in DOM
  const visibleItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {visibleItems.map(item => <Row key={item.id} data={item} />)}
      <Pagination page={page} onChange={setPage} />
    </div>
  );
}`,
        instructions: [
          'Use pagination or virtualization (react-window) for lists longer than 50 items.',
          'Replace nested unnecessary <div> wrappers with React fragments (<> ... </>).',
          'Lazy-render below-the-fold accordion panels until user expands them.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Clean up heavy page builder markup (Elementor/Divi wrapper bloat).',
        codeLanguage: 'text',
        codeSnippet: `1. In Elementor Settings > Features:
   - Enable "Optimized DOM Output"
   - Enable "Improved Asset Loading"
2. Limit blog/product archive queries to 12 items per page`,
        instructions: [
          'Turn on "Optimized DOM Output" in page builder settings.',
          'Set posts per page to 10–12 in Settings > Reading.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'General HTML Best Practice',
        description: 'Audit DOM depth using browser developer tools.',
        codeLanguage: 'bash',
        codeSnippet: `// Run in Browser Console to inspect node count:
document.querySelectorAll('*').length`,
        instructions: [
          'Target less than 800 total elements on mobile landing pages.',
        ],
      },
    ],
  },

  'font-display': {
    auditId: 'font-display',
    title: 'Ensure Text Remains Visible During Webfont Load (font-display: swap)',
    category: 'fonts',
    categoryLabel: 'Fonts & Typography',
    severity: 'medium',
    whyItMatters:
      'Webfonts without font-display: swap hide text completely (Flash of Invisible Text / FOIT) until the font file finishes downloading over the network.',
    estimatedSavingsDescription: 'Eliminates FOIT text rendering delay (up to 1.5s).',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js (next/font)',
        description: 'Use next/font/google which automatically self-hosts and applies display: swap.',
        codeLanguage: 'tsx',
        codeSnippet: `// In your layout.tsx:
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Keeps fallback system font visible immediately
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}`,
        instructions: [
          'Always set display: "swap" in next/font definitions.',
          'Preload only primary subsets (latin).',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress / CSS',
        description: 'Add font-display: swap to @font-face rules.',
        codeLanguage: 'css',
        codeSnippet: `@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Immediately renders fallback font */
}`,
        instructions: [
          'Add font-display: swap to all custom font stylesheets.',
          'If loading Google Fonts via <link>, append &display=swap to the Google Fonts URL.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'Preload Tag',
        description: 'Add preload links for your primary WOFF2 body font.',
        codeLanguage: 'html',
        codeSnippet: `<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin="anonymous">`,
        instructions: [
          'Preload only 1–2 primary body/heading font files to avoid bandwidth contention.',
        ],
      },
    ],
  },

  'cumulative-layout-shift': {
    auditId: 'cumulative-layout-shift',
    title: 'Prevent Layout Shifts (CLS < 0.1)',
    category: 'performance',
    categoryLabel: 'DOM & Rendering',
    severity: 'high',
    whyItMatters:
      'Elements moving unexpectedly while the page loads causes accidental user clicks and poor user experience. Google ranks visual stability through Cumulative Layout Shift (CLS).',
    estimatedSavingsDescription: 'Maintains stable layout and passes Core Web Vitals threshold (CLS <= 0.1).',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / CSS',
        description: 'Always specify explicit width and height or aspect-ratio on images, videos, and dynamic containers.',
        codeLanguage: 'tsx',
        codeSnippet: `// 1. Always supply dimensions to Image
<Image src="/logo.png" width={160} height={40} alt="Logo" />

// 2. For dynamic banner containers, reserve min-height in CSS:
<div className="min-h-[250px] w-full bg-slate-100 dark:bg-white/5 rounded-2xl">
  {adOrDynamicWidget}
</div>`,
        instructions: [
          'Always supply explicit width and height on <img> and <Image> tags.',
          'Reserve static placeholder space for dynamic ads, embeds, and client banners using min-height or aspect-ratio.',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Enable missing image dimension auto-addition.',
        codeLanguage: 'text',
        codeSnippet: `1. Open WP Rocket > Media
2. Enable "Add Missing Image Dimensions"
3. Set reserve container min-height for sticky headers & AdSense blocks`,
        instructions: [
          'Turn on "Add Missing Image Dimensions" in caching plugin.',
          'Fix theme templates that render <img> tags without width and height attributes.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'CSS Aspect Ratio',
        description: 'Use modern CSS aspect-ratio on media containers.',
        codeLanguage: 'css',
        codeSnippet: `.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}`,
        instructions: [
          'Use aspect-ratio: 16 / 9 for video iframe embeds.',
        ],
      },
    ],
  },
};

/**
 * Returns a detailed fix guide for an audit ID, with an intelligent fallback if an unknown audit ID is passed.
 */
export function getSpeedFixGuide(auditId: string, fallbackTitle?: string, fallbackDescription?: string): SpeedAuditFixGuide {
  const existing = SPEED_FIX_GUIDES_MAP[auditId];
  if (existing) return existing;

  // Keyword-based fallback matching
  const lowerId = (auditId + ' ' + (fallbackTitle || '')).toLowerCase();

  let category: SpeedAuditFixGuide['category'] = 'performance';
  let categoryLabel = 'Performance & Speed';

  if (lowerId.includes('image') || lowerId.includes('picture')) {
    category = 'images';
    categoryLabel = 'Images & Media';
  } else if (lowerId.includes('script') || lowerId.includes('js') || lowerId.includes('javascript')) {
    category = 'javascript';
    categoryLabel = 'JavaScript';
  } else if (lowerId.includes('css') || lowerId.includes('style')) {
    category = 'css';
    categoryLabel = 'CSS Styles';
  } else if (lowerId.includes('server') || lowerId.includes('cache') || lowerId.includes('ttl') || lowerId.includes('response')) {
    category = 'server';
    categoryLabel = 'Server & Caching';
  } else if (lowerId.includes('font')) {
    category = 'fonts';
    categoryLabel = 'Typography';
  } else if (lowerId.includes('dom') || lowerId.includes('node')) {
    category = 'dom';
    categoryLabel = 'DOM & Layout';
  }

  return {
    auditId,
    title: fallbackTitle || auditId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category,
    categoryLabel,
    severity: 'medium',
    whyItMatters:
      fallbackDescription ||
      'This technical factor delays browser parsing, inflates network payload transfer, or increases client layout calculation latency.',
    estimatedSavingsDescription: 'Optimizing this improves your Google Lighthouse performance score and user experience.',
    guides: [
      {
        platform: 'nextjs',
        platformLabel: 'Next.js / React',
        description: 'Optimize rendering and resource loading in Next.js.',
        codeLanguage: 'tsx',
        codeSnippet: `// Audit and streamline component rendering
import dynamic from 'next/dynamic';

// Defer non-critical client component
const DeferredWidget = dynamic(() => import('@/components/Widget'), { ssr: false });`,
        instructions: [
          'Isolate this resource to load asynchronously or lazily after critical content renders.',
          'Review network waterfall in browser DevTools (F12 > Network tab).',
        ],
      },
      {
        platform: 'wordpress',
        platformLabel: 'WordPress',
        description: 'Optimize via caching and asset minimization.',
        codeLanguage: 'text',
        codeSnippet: `1. Enable page caching and Gzip/Brotli compression in your hosting panel.
2. Review active plugins and remove unneeded extensions.`,
        instructions: [
          'Enable caching and asset compression in your caching plugin.',
          'Test page speed again to verify score improvements.',
        ],
      },
      {
        platform: 'server',
        platformLabel: 'Server & CDN',
        description: 'Configure server-level compression and edge caching headers.',
        codeLanguage: 'nginx',
        codeSnippet: `# Enable Brotli / Gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;`,
        instructions: [
          'Ensure server compression (Gzip / Brotli) is enabled for text assets.',
        ],
      },
    ],
  };
}
