import { saveActivityLog } from './db';

/**
 * Extracts client IP address from incoming Next.js Request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Extracts or generates a session ID for tracking tool usage frequency per user session
 */
export function getSessionId(req: Request): string {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/analyze_session_id=([^;]+)/);
  if (match) {
    return match[1];
  }
  // Fallback to IP address based session identifier
  return `session_${getClientIp(req).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Log tool activity to database
 */
export async function logToolUsage(req: Request, toolName: string, targetUrl?: string): Promise<void> {
  try {
    const ip = getClientIp(req);
    const sessionId = getSessionId(req);
    await saveActivityLog({
      session_id: sessionId,
      ip_address: ip,
      tool_name: toolName,
      target_url: targetUrl || null,
    });
  } catch (error) {
    console.error('[Activity Log Error]', error);
  }
}
