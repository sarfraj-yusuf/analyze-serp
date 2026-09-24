import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/api', '/admin/', '/admin', '/dashboard/', '/dashboard'],
    },
    sitemap: 'https://analyzeserp.com/sitemap.xml',
  };
}
