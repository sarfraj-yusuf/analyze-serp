/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/technical-health',
        destination: '/site-speed-checker',
        permanent: true, // 301 Permanent Redirect
      },
      {
        source: '/link-inspector',
        destination: '/affiliate-link-checker',
        permanent: true, // 301 Permanent Redirect
      },
      {
        source: '/serp-simulator',
        destination: '/serp-snippet-preview',
        permanent: true, // 301 Permanent Redirect
      },
      {
        source: '/competitor-audit',
        destination: '/',
        permanent: true, // 301 Permanent Redirect
      },
    ];
  },
};

export default nextConfig;
