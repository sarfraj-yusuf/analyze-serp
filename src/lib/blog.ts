import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorRole: string;
  authorTwitter?: string;
  authorLinkedin?: string;
  category: string;
  tags: string[];
  image: string;
  featured?: boolean;
  readingTimeMinutes: number;
}

export interface BlogPost {
  meta: BlogPostMeta;
  content: string;
  toc: TOCItem[];
}

/**
 * Automatically extracts H2 (##) and H3 (###) headings for Table of Contents,
 * excluding "Table of Contents" itself and article title.
 */
export function extractTableOfContents(content: string, postTitle?: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  const normalizedTitle = postTitle ? postTitle.toLowerCase().trim() : '';

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*_~`]/g, '');
    const lowerText = text.toLowerCase();

    // Ignore "Table of Contents", "Contents", "TOC", or matching post title
    if (
      lowerText === 'table of contents' ||
      lowerText === 'contents' ||
      lowerText === 'toc' ||
      (normalizedTitle && lowerText === normalizedTitle)
    ) {
      continue;
    }

    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({ id, text, level });
  }

  return toc;
}

const blogsDirectory = path.join(process.cwd(), 'content/blogs');

/**
 * Calculates estimated reading time in minutes based on word count
 */
function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Ensures the content/blogs directory exists
 */
function ensureBlogsDirectory(): void {
  if (!fs.existsSync(blogsDirectory)) {
    fs.mkdirSync(blogsDirectory, { recursive: true });
  }
}

/**
 * Fetches all blog posts sorted by publish date (newest first)
 */
export function getAllBlogPosts(): BlogPostMeta[] {
  ensureBlogsDirectory();
  const fileNames = fs.readdirSync(blogsDirectory);

  const posts: BlogPostMeta[] = fileNames
    .filter((fileName) => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(blogsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || 'Untitled Post',
        description: data.description || '',
        date: data.date || new Date().toISOString().split('T')[0],
        author: data.author || 'Sarfraj Yusuf',
        authorRole: data.authorRole || 'Founder & Senior SEO Strategist',
        authorTwitter: data.authorTwitter || 'https://twitter.com/sarfrajyusuf',
        authorLinkedin: data.authorLinkedin || 'https://linkedin.com/in/sarfrajyusuf',
        category: data.category || 'General SEO',
        tags: Array.isArray(data.tags) ? data.tags : ['SEO'],
        image: data.image || '/blog/default-banner.jpg',
        featured: Boolean(data.featured),
        readingTimeMinutes: calculateReadingTime(content),
      };
    });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches paginated blog posts (limit = 9 per page)
 */
export function getPaginatedBlogPosts(page: number = 1, limit: number = 9): {
  posts: BlogPostMeta[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
} {
  const allPosts = getAllBlogPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * limit;
  const posts = allPosts.slice(startIndex, startIndex + limit);

  return {
    posts,
    totalPosts,
    totalPages,
    currentPage,
  };
}

/**
 * Fetches a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  ensureBlogsDirectory();
  try {
    let fullPath = path.join(blogsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(blogsDirectory, `${slug}.md`);
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const meta: BlogPostMeta = {
      slug,
      title: data.title || 'Untitled Post',
      description: data.description || '',
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author || 'Sarfraj Yusuf',
      authorRole: data.authorRole || 'Founder & Senior SEO Strategist',
      authorTwitter: data.authorTwitter || 'https://twitter.com/sarfrajyusuf',
      authorLinkedin: data.authorLinkedin || 'https://linkedin.com/in/sarfrajyusuf',
      category: data.category || 'General SEO',
      tags: Array.isArray(data.tags) ? data.tags : ['SEO'],
      image: data.image || '/blog/default-banner.jpg',
      readingTimeMinutes: calculateReadingTime(content),
    };

    const toc = extractTableOfContents(content, meta.title);

    return { meta, content, toc };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Collects all unique categories/tags
 */
export function getAllBlogCategories(): string[] {
  const posts = getAllBlogPosts();
  const categories = new Set(posts.map((p) => p.category));
  return Array.from(categories);
}

/**
 * Generates valid RSS 2.0 XML Feed string
 */
export function generateRssFeedXml(): string {
  const posts = getAllBlogPosts();
  const baseUrl = 'https://analyzeserp.com';

  const itemsXml = posts
    .map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author><![CDATA[${post.author}]]></author>
      <category><![CDATA[${post.category}]]></category>
    </item>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AnalyzeSERP SEO Knowledge Base &amp; Guides</title>
    <link>${baseUrl}/blog</link>
    <description>Actionable competitor SEO audit guides, keyword gap strategies, Flesch readability tutorials, and Google ranking tactics by Sarfraj Yusuf.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;
}
