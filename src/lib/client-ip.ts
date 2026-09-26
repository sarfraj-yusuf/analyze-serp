import { NextRequest } from 'next/server';

/**
 * Validates that an IP string is a syntactically valid IPv4 or IPv6 address.
 */
export function isValidIp(rawIp: string): boolean {
  if (!rawIp || typeof rawIp !== 'string') return false;
  const ip = rawIp.trim();
  if (ip.length === 0 || ip.length > 45) return false;

  // IPv4 validation: exactly 4 octets, 0-255
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    const octets = ip.split('.').map(Number);
    return octets.every((o) => !isNaN(o) && o >= 0 && o <= 255);
  }

  // IPv6 validation: hex groups separated by colons
  if (ip.includes(':') && /^[0-9a-fA-F:]+$/.test(ip)) {
    return true;
  }

  return false;
}

/**
 * Strips optional port numbers from an IP address string.
 * Examples: "192.168.1.1:8080" -> "192.168.1.1", "[::1]:8080" -> "::1"
 */
function cleanIp(raw: string): string {
  let ip = raw.trim();
  if (ip.startsWith('[') && ip.includes(']')) {
    const endBracket = ip.indexOf(']');
    ip = ip.substring(1, endBracket);
  } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(ip)) {
    ip = ip.split(':')[0];
  }
  return ip.trim();
}

/**
 * Checks if an IP is a private/loopback RFC1918 or RFC4193 address
 */
export function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}

/**
 * Canonical Trusted Client IP Extraction Helper
 *
 * Centralizes IP resolution across Rate Limiters, Bot Detection, Admin APIs,
 * Activity Loggers, and Security Incident Trackers.
 *
 * Security Trust Architecture:
 * 1. Cloudflare Edge header (`cf-connecting-ip`)
 *    - Cloudflare Edge unconditionally overwrites this header with the real connecting socket IP.
 *    - Client-forged values are stripped by Cloudflare edge.
 *
 * 2. Reverse Proxy header (`x-real-ip`)
 *    - Standard header set by upstream Nginx / Caddy / Hostinger reverse proxies (`proxy_set_header X-Real-IP $remote_addr`).
 *
 * 3. Sanitized `x-forwarded-for`
 *    - Traversed right-to-left: Upstream proxies append incoming client IPs to the RIGHT of X-Forwarded-For.
 *    - Client-supplied spoofed IPs reside on the LEFT.
 *    - We inspect right-to-left and return the rightmost non-private IP hop.
 *
 * 4. Fallback: '127.0.0.1'
 */
export function getTrustedClientIp(req: Request | { headers: Headers } | NextRequest): string {
  const headers = req.headers;

  // 1. Cloudflare Edge header (tamper-proof when proxied through Cloudflare)
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {
    const cleaned = cleanIp(cfIp);
    if (isValidIp(cleaned)) {
      return cleaned;
    }
  }

  // 2. Direct Reverse Proxy header (Nginx / Hostinger / Caddy / Traefik)
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    const cleaned = cleanIp(realIp);
    if (isValidIp(cleaned)) {
      return cleaned;
    }
  }

  // 3. X-Forwarded-For header (sanitized right-to-left)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor
      .split(',')
      .map((p) => cleanIp(p))
      .filter((p) => isValidIp(p));

    // Prefer the rightmost non-private IP
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!isPrivateIp(parts[i])) {
        return parts[i];
      }
    }

    // If all hops are private (e.g. local staging or container mesh), return the rightmost valid IP
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }

  return '127.0.0.1';
}
