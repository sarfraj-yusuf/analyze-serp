import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://analyzeserp.com';

  const blogPosts = getAllBlogPosts();

  // Blog posts provide trustworthy editorial modification dates from frontmatter (lastModified or publish date)
  const blogSitemapEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const rawDate = post.lastModified || post.date;
    const isTrustworthyDate = rawDate && !isNaN(new Date(rawDate).getTime());

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      ...(isTrustworthyDate ? { lastModified: rawDate } : {}),
    };
  });

  // Static URLs omit lastModified because we do not have an automated, trustworthy
  // content-revision timestamp for them. Omitting lastmod is strictly preferred over
  // emitting artificial deployment dates or arbitrary timestamps.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}` },
    { url: `${baseUrl}/featured-snippet-optimizer` },
    { url: `${baseUrl}/content-scratchpad` },
    { url: `${baseUrl}/internal-link-mapper` },
    { url: `${baseUrl}/technical-health` },
    { url: `${baseUrl}/site-speed-checker` },
    { url: `${baseUrl}/contrast-checker` },
    { url: `${baseUrl}/redirect-checker` },
    { url: `${baseUrl}/serp-snippet-preview` },
    { url: `${baseUrl}/affiliate-link-checker` },
    { url: `${baseUrl}/readability` },
    { url: `${baseUrl}/pdf-reports` },
    { url: `${baseUrl}/pricing` },
    { url: `${baseUrl}/blog` },
    { url: `${baseUrl}/changelog` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/terms` },
  ];

  return [...staticEntries, ...blogSitemapEntries];
}
