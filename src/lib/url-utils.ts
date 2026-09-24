/**
 * Client- and server-safe URL normalization and validation utilities.
 */

/**
 * Normalizes a URL string by ensuring it starts with https:// if no protocol was supplied.
 */
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return '';
  
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith('//')) {
      url = `https:${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  return url;
}

/**
 * Checks whether an input string is a valid web URL or domain name.
 * Validates protocol, hostname structure, and Top-Level Domain (TLD).
 */
export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (/\s/.test(trimmed)) return false;

  try {
    const normalized = normalizeUrl(trimmed);
    const parsed = new URL(normalized);

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname;
    if (!host || host.length < 3) return false;

    // Allow localhost for local development
    if (host === 'localhost') return true;

    // IPv4 address check
    const isIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
    if (isIpv4) return true;

    // Standard FQDN check: must have at least one dot, and TLD must be >= 2 characters
    const parts = host.split('.');
    if (parts.length < 2) return false;

    // Disallow empty parts (e.g. "example..com")
    if (parts.some((p) => p.length === 0)) return false;

    const tld = parts[parts.length - 1];
    // TLD must consist of alpha characters and be at least 2 chars long
    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts a concise display hostname (e.g., "example.com" without "www.").
 */
export function getDisplayHostname(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}
