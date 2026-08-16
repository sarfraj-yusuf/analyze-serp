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
        source: '/serp-simulator',
        destination: '/serp-snippet-preview',
        permanent: true,
      },
      {
        source: '/link-inspector',
        destination: '/affiliate-link-checker',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
