import { promises as dns } from 'dns';

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
  // Cloud metadata endpoints
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
 * Validates that a URL is safe to fetch (not targeting private/internal infrastructure).
 * Performs DNS resolution and checks all returned IPs against blocked ranges.
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
    throw new Error(`Blocked request to internal hostname "${hostname}".`);
  }

  // Check if hostname is a raw IP address (IPv4 or IPv6)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isRawIPv4 = ipv4Regex.test(hostname);
  const isRawIPv6 = hostname.startsWith('[') || hostname.includes(':');

  if (isRawIPv4) {
    if (isBlockedIPv4(hostname)) {
      throw new Error(`Blocked request to private/reserved IPv4 address "${hostname}".`);
    }
    return; // Raw IP, no DNS needed
  }

  if (isRawIPv6) {
    const cleanIPv6 = hostname.replace(/^\[|\]$/g, '');
    if (isBlockedIPv6(cleanIPv6)) {
      throw new Error(`Blocked request to private/reserved IPv6 address "${hostname}".`);
    }
    return; // Raw IP, no DNS needed
  }

  // DNS resolution — check ALL resolved IPs (A + AAAA records)
  try {
    const addresses = await dns.resolve(hostname);

    for (const ip of addresses) {
      if (isBlockedIPv4(ip)) {
        throw new Error(`Blocked: "${hostname}" resolves to private/reserved IP ${ip}.`);
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
        throw new Error(`Blocked: "${hostname}" resolves to private/reserved IPv6 address ${ip}.`);
      }
    }
  } catch {
    // No AAAA records is fine — most domains are IPv4 only
  }
}
