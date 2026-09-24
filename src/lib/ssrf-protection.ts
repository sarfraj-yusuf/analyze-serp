import { promises as dns } from 'dns';
import { logSecurityIncident } from '@/lib/db';

function recordSsrfIncident(url: string, reason: string) {
  logSecurityIncident({
    incident_type: 'SSRF_BLOCKED',
    severity: 'high',
    ip_address: 'inbound',
    target_endpoint: url,
    details: reason,
  }).catch(() => {});
}

/**
 * SSRF (Server-Side Request Forgery) Protection Module
 *
 * Validates that a user-supplied URL does not resolve to a private, internal,
 * or reserved IP address before the server makes an outbound HTTP request.
 *
 * Blocks: localhost, RFC 1918 private ranges, link-local, loopback,
 * AWS/cloud metadata endpoints, and other reserved IP blocks.
 */

// ── Private / Reserved IPv4 CIDR Ranges ──
const BLOCKED_IPV4_RANGES: { prefix: number[]; mask: number }[] = [
  { prefix: [0],              mask: 8  },   // 0.0.0.0/8        — Current network
  { prefix: [10],             mask: 8  },   // 10.0.0.0/8       — RFC 1918 Private
  { prefix: [100, 64],        mask: 10 },   // 100.64.0.0/10    — Carrier-grade NAT
  { prefix: [127],            mask: 8  },   // 127.0.0.0/8      — Loopback
  { prefix: [169, 254],       mask: 16 },   // 169.254.0.0/16   — Link-local
  { prefix: [172, 16],        mask: 12 },   // 172.16.0.0/12    — RFC 1918 Private
  { prefix: [192, 0, 0],      mask: 24 },   // 192.0.0.0/24     — IETF Protocol Assignments
  { prefix: [192, 0, 2],      mask: 24 },   // 192.0.2.0/24     — TEST-NET-1
  { prefix: [192, 88, 99],    mask: 24 },   // 192.88.99.0/24   — 6to4 Relay Anycast
  { prefix: [192, 168],       mask: 16 },   // 192.168.0.0/16   — RFC 1918 Private
  { prefix: [198, 18],        mask: 15 },   // 198.18.0.0/15    — Benchmark testing
  { prefix: [198, 51, 100],   mask: 24 },   // 198.51.100.0/24  — TEST-NET-2
  { prefix: [203, 0, 113],    mask: 24 },   // 203.0.113.0/24   — TEST-NET-3
  { prefix: [224],            mask: 4  },   // 224.0.0.0/4      — Multicast
  { prefix: [240],            mask: 4  },   // 240.0.0.0/4      — Reserved / Future use
  { prefix: [255, 255, 255, 255], mask: 32 }, // Broadcast
];

// ── Blocked Hostnames (case-insensitive) ──
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  // Cloud metadata endpoints & aliases
  'instance-data',
  '169.254.169.254',
  'metadata.google.internal',
  'metadata.google',
  'kubernetes.default.svc',
]);

/**
 * Converts an IPv4 address string to a 32-bit unsigned integer.
 */
function ipv4ToInt(ip: string): number {
  const octets = ip.split('.').map(Number);
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

/**
 * Converts a CIDR prefix + mask to a 32-bit integer for comparison.
 */
function prefixToInt(prefix: number[]): number {
  const padded = [...prefix, 0, 0, 0, 0].slice(0, 4);
  return ((padded[0] << 24) | (padded[1] << 16) | (padded[2] << 8) | padded[3]) >>> 0;
}

/**
 * Checks whether an IPv4 address falls within any blocked CIDR range.
 */
function isBlockedIPv4(ip: string): boolean {
  const ipInt = ipv4ToInt(ip);

  for (const range of BLOCKED_IPV4_RANGES) {
    const rangeStart = prefixToInt(range.prefix);
    const mask = (0xFFFFFFFF << (32 - range.mask)) >>> 0;

    if ((ipInt & mask) === (rangeStart & mask)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether an IPv6 address is a blocked loopback or private address.
 */
function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // ::1 — IPv6 loopback
  if (normalized === '::1' || normalized === '0000:0000:0000:0000:0000:0000:0000:0001') {
    return true;
  }

  // :: — Unspecified address
  if (normalized === '::' || normalized === '0000:0000:0000:0000:0000:0000:0000:0000') {
    return true;
  }

  // fe80::/10 — Link-local
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe80')) {
    return true;
  }

  // fc00::/7 — Unique local addresses (RFC 4193)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  // ::ffff:x.x.x.x — IPv4-mapped IPv6 addresses → check the embedded IPv4
  const v4Mapped = normalized.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4Mapped) {
    return isBlockedIPv4(v4Mapped[1]);
  }

  return false;
}

/**
 * Parses obfuscated IPv4 formats (standard dotted-decimal, DWORD integer, octal, hex)
 * into a canonical dotted-decimal IPv4 string, or null if the hostname is a regular domain.
 */
function parsePotentialIpAddress(hostname: string): string | null {
  const cleaned = hostname.replace(/^\[|\]$/g, '').trim().toLowerCase();

  // 1. Standard dotted-decimal IPv4 (e.g. 192.168.1.1)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleaned)) {
    const octets = cleaned.split('.').map(Number);
    if (octets.every((o) => o >= 0 && o <= 255)) {
      return cleaned;
    }
  }

  // 2. Pure integer / DWORD IPv4 (e.g. 2130706433 -> 127.0.0.1, 0 -> 0.0.0.0)
  if (/^\d+$/.test(cleaned)) {
    const num = Number(cleaned);
    if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
    }
  }

  // 3. Obfuscated hex or octal notation (e.g. 0x7f000001, 0177.0.0.1, 0x7f.0.0.1)
  const parts = cleaned.split('.');
  if (parts.length > 0 && parts.length <= 4) {
    const numericParts: number[] = [];
    for (const part of parts) {
      let val: number;
      if (part.startsWith('0x')) {
        val = parseInt(part, 16);
      } else if (part.startsWith('0') && part.length > 1 && /^[0-7]+$/.test(part)) {
        val = parseInt(part, 8);
      } else if (/^\d+$/.test(part)) {
        val = parseInt(part, 10);
      } else {
        return null; // Contains non-numeric domain characters (e.g. example.com)
      }
      if (isNaN(val) || val < 0) return null;
      numericParts.push(val);
    }

    if (numericParts.length === 4) {
      if (numericParts.every((p) => p <= 255)) {
        return numericParts.join('.');
      }
    } else if (numericParts.length === 1) {
      const num = numericParts[0];
      if (num <= 0xffffffff) {
        return [
          (num >>> 24) & 255,
          (num >>> 16) & 255,
          (num >>> 8) & 255,
          num & 255,
        ].join('.');
      }
    }
  }

  return null;
}

/**
 * Validates that a URL is safe to fetch (not targeting private/internal infrastructure).
 * Performs IP normalization, blocked range comparison, and DNS resolution checks.
 *
 * @param url - The fully-qualified URL to validate
 * @throws Error if the URL targets a blocked/private address
 */
export async function validateUrlSafety(url: string): Promise<void> {
  let hostname: string;

  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;

    // Block non-HTTP protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Blocked protocol "${parsed.protocol}". Only HTTP/HTTPS URLs are allowed.`);
    }
  } catch (err: any) {
    if (err.message.startsWith('Blocked protocol')) throw err;
    throw new Error(`Invalid URL format: "${url}"`);
  }

  // Block known dangerous hostnames
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
    const msg = `Blocked request to internal hostname "${hostname}".`;
    recordSsrfIncident(url, msg);
    throw new Error(msg);
  }

  // Check if hostname is an obfuscated or raw IPv4 address (DWORD, octal, hex, or standard)
  const potentialIpv4 = parsePotentialIpAddress(hostname);
  if (potentialIpv4) {
    if (isBlockedIPv4(potentialIpv4)) {
      const msg = `Blocked request to private/reserved IPv4 address "${hostname}" (resolved: ${potentialIpv4}).`;
      recordSsrfIncident(url, msg);
      throw new Error(msg);
    }
    return; // Raw IP, no DNS needed
  }

  // Check if hostname is a raw IPv6 address
  const isRawIPv6 = hostname.startsWith('[') || hostname.includes(':');
  if (isRawIPv6) {
    const cleanIPv6 = hostname.replace(/^\[|\]$/g, '');
    if (isBlockedIPv6(cleanIPv6)) {
      const msg = `Blocked request to private/reserved IPv6 address "${hostname}".`;
      recordSsrfIncident(url, msg);
      throw new Error(msg);
    }
    return; // Raw IP, no DNS needed
  }

  // DNS resolution — check ALL resolved IPs (A + AAAA records)
  try {
    const addresses = await dns.resolve(hostname);

    for (const ip of addresses) {
      if (isBlockedIPv4(ip)) {
        const msg = `Blocked: "${hostname}" resolves to private/reserved IP ${ip}.`;
        recordSsrfIncident(url, msg);
        throw new Error(msg);
      }
    }
  } catch (err: any) {
    // If DNS fails with our custom SSRF message, re-throw it
    if (err.message.startsWith('Blocked')) throw err;

    // DNS resolution failure (NXDOMAIN, etc.) — let the fetch itself handle this
    // so the user gets a normal "failed to fetch" error
  }

  // Also check AAAA (IPv6) records if available
  try {
    const v6Addresses = await dns.resolve6(hostname);

    for (const ip of v6Addresses) {
      if (isBlockedIPv6(ip)) {
        const msg = `Blocked: "${hostname}" resolves to private/reserved IPv6 address ${ip}.`;
        recordSsrfIncident(url, msg);
        throw new Error(msg);
      }
    }
  } catch {
    // No AAAA records is fine — most domains are IPv4 only
  }
}

export interface SafeFetchOptions extends RequestInit {
  maxRedirects?: number;
}

/**
 * Hardened fetch client that prevents SSRF via HTTP 30x redirects:
 * - Pre-validates target URL with validateUrlSafety()
 * - Sets redirect: 'manual' to prevent native fetch from silently following redirects to private IPs
 * - Re-validates each redirect hop destination before following (up to maxRedirects)
 */
export async function safeFetchWithSsrf(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const maxRedirects = options.maxRedirects ?? 5;
  let currentUrl = targetUrl;
  let redirectCount = 0;

  while (true) {
    // 1. Validate safety of current hop URL
    await validateUrlSafety(currentUrl);

    // 2. Fetch using manual redirect mode
    const fetchOptions: RequestInit = {
      ...options,
      redirect: 'manual',
    };

    const response = await fetch(currentUrl, fetchOptions);

    // 3. Check for redirect response status codes
    const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
    if (!isRedirect) {
      return response;
    }

    redirectCount++;
    if (redirectCount > maxRedirects) {
      throw new Error(`Too many redirects (exceeded maximum limit of ${maxRedirects} hops).`);
    }

    const locationHeader = response.headers.get('location');
    if (!locationHeader) {
      return response;
    }

    // Resolve relative redirect location against current URL
    currentUrl = new URL(locationHeader, currentUrl).toString();
  }
}

