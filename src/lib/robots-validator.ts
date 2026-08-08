import { RobotsValidationResult } from '@/types/seo';

/**
 * Fetches and validates live robots.txt rules for a target website URL.
 * Tests if Googlebot / general crawlers are allowed or blocked for the URL path.
 */
export async function validateRobotsTxt(targetUrl: string): Promise<RobotsValidationResult> {
  try {
    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;
    const path = parsedUrl.pathname + parsedUrl.search;
    const robotsUrl = `${origin}/robots.txt`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const res = await fetch(robotsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      return {
        status: 'NO_ROBOTS_TXT',
        robotsUrl,
        sitemaps: [],
        userAgentsFound: [],
      };
    }

    const text = await res.text();
    const lines = text.split(/\r?\n/);

    const sitemaps: string[] = [];
    const userAgentsFound = new Set<string>();

    let currentAgent = '';
    let isTargetAgent = false;
    let matchedDisallowRule: string | undefined = undefined;
    let matchedAllowRule: string | undefined = undefined;

    for (let line of lines) {
      // Trim comments and whitespace
      const commentIdx = line.indexOf('#');
      if (commentIdx !== -1) {
        line = line.substring(0, commentIdx);
      }
      line = line.trim();
      if (!line) continue;

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const directive = line.substring(0, colonIdx).trim().toLowerCase();
      const value = line.substring(colonIdx + 1).trim();

      if (directive === 'sitemap' && value) {
        sitemaps.push(value);
      } else if (directive === 'user-agent') {
        currentAgent = value.toLowerCase();
        userAgentsFound.add(value);
        isTargetAgent = currentAgent === '*' || currentAgent.includes('googlebot');
      } else if (isTargetAgent) {
        if (directive === 'disallow' && value) {
          if (doesPathMatchPattern(path, value)) {
            if (!matchedDisallowRule || value.length > matchedDisallowRule.length) {
              matchedDisallowRule = `Disallow: ${value}`;
            }
          }
        } else if (directive === 'allow' && value) {
          if (doesPathMatchPattern(path, value)) {
            if (!matchedAllowRule || value.length > matchedAllowRule.length) {
              matchedAllowRule = `Allow: ${value}`;
            }
          }
        }
      }
    }

    // Allow rules take precedence if longer or matching exact path
    const isBlocked =
      !!matchedDisallowRule &&
      (!matchedAllowRule || matchedDisallowRule.length >= matchedAllowRule.length);

    return {
      status: isBlocked ? 'BLOCKED' : 'ALLOWED',
      robotsUrl,
      matchedRule: isBlocked ? matchedDisallowRule : matchedAllowRule,
      sitemaps: sitemaps.slice(0, 5),
      userAgentsFound: Array.from(userAgentsFound).slice(0, 8),
    };
  } catch (error) {
    return {
      status: 'NO_ROBOTS_TXT',
      robotsUrl: `${targetUrl}/robots.txt`,
      sitemaps: [],
      userAgentsFound: [],
    };
  }
}

/**
 * Checks if a URL path matches a robots.txt wildcard pattern (e.g. /admin/* or /*?s=)
 */
function doesPathMatchPattern(path: string, pattern: string): boolean {
  if (pattern === '/' || pattern === '/*') return true;

  // Convert robots.txt pattern to RegExp
  let regexStr = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars except * and $
    .replace(/\*/g, '.*');

  if (regexStr.endsWith('$')) {
    regexStr = regexStr.slice(0, -1) + '$';
  }

  try {
    const regex = new RegExp('^' + regexStr);
    return regex.test(path);
  } catch {
    return path.startsWith(pattern);
  }
}
